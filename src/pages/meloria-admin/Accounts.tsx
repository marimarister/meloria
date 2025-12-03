import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Account {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  is_admin: boolean;
  company_id: string | null;
  company_name: string | null;
  last_sign_in: string | null;
}

interface CompanyGroup {
  id: string;
  name: string;
}

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [resettingAccount, setResettingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
    role: "",
    company_id: "",
  });

  useEffect(() => {
    fetchAccounts();
    fetchCompanyGroups();
  }, []);

  const fetchCompanyGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("company_groups")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCompanyGroups(data || []);
    } catch (error) {
      console.error("Error fetching company groups:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      // Fetch profiles with email
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, surname, email");

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch meloria admins
      const { data: admins, error: adminsError } = await supabase
        .from("meloria_admins" as any)
        .select("user_id");

      if (adminsError) throw adminsError;

      // Fetch group members to find company assignments
      const { data: members, error: membersError } = await supabase
        .from("group_members" as any)
        .select("email, group_id, company_groups(id, name)");

      if (membersError) throw membersError;

      // Fetch last sign in for each user using the database function
      const accountsData: Account[] = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const userRole = roles?.find((r: any) => r.user_id === profile.id);
          const isAdmin = admins?.some((a: any) => a.user_id === profile.id);
          const memberInfo = members?.find((m: any) => 
            m.email?.toLowerCase() === profile.email?.toLowerCase()
          );

          // Fetch last sign in using the database function
          let lastSignIn = null;
          try {
            const { data: signInData } = await supabase
              .rpc('get_user_last_sign_in', { _user_id: profile.id });
            lastSignIn = signInData;
          } catch (e) {
            // Ignore errors for last sign in
          }

          return {
            id: profile.id,
            user_id: profile.id,
            name: profile.name || "",
            surname: profile.surname || "",
            email: profile.email || "",
            role: userRole?.role || "employee",
            is_admin: isAdmin || false,
            company_id: (memberInfo as any)?.company_groups?.id || null,
            company_name: isAdmin ? "Meloria" : ((memberInfo as any)?.company_groups?.name || null),
            last_sign_in: lastSignIn,
          };
        })
      );

      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setEditForm({
      name: account.name,
      surname: account.surname,
      role: account.is_admin ? "admin" : account.role,
      company_id: account.company_id || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: editForm.name,
          surname: editForm.surname,
        })
        .eq("id", editingAccount.id);

      if (profileError) throw profileError;

      // Handle role changes
      const wasAdmin = editingAccount.is_admin;
      const isNowAdmin = editForm.role === "admin";
      const previousRole = editingAccount.role;
      const newRole = editForm.role === "admin" ? previousRole : editForm.role;

      // If changing to/from admin, update meloria_admins table
      if (wasAdmin && !isNowAdmin) {
        // Remove from meloria_admins
        const { error: removeAdminError } = await supabase
          .from("meloria_admins" as any)
          .delete()
          .eq("user_id", editingAccount.id);

        if (removeAdminError) throw removeAdminError;
      } else if (!wasAdmin && isNowAdmin) {
        // Check if already exists in meloria_admins first
        const { data: existingAdmin } = await supabase
          .from("meloria_admins" as any)
          .select("id")
          .eq("user_id", editingAccount.id)
          .maybeSingle();

        if (!existingAdmin) {
          // Add to meloria_admins only if not already there
          const { error: addAdminError } = await supabase
            .from("meloria_admins" as any)
            .insert({ user_id: editingAccount.id });

          if (addAdminError) throw addAdminError;
        }
      }

      // Update user_roles if role changed (but not if just changing admin status)
      if (editForm.role !== "admin" && newRole !== previousRole) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: newRole as any })
          .eq("user_id", editingAccount.id);

        if (roleError) throw roleError;
      }

      // Handle company assignment - only if user has an email
      const previousCompanyId = editingAccount.company_id;
      const newCompanyId = editForm.company_id || null;

      if (previousCompanyId !== newCompanyId && editingAccount.email) {
        // First, check if user has an existing group_member entry
        const { data: existingMember } = await supabase
          .from("group_members" as any)
          .select("id")
          .eq("email", editingAccount.email)
          .maybeSingle();

        if (newCompanyId) {
          if (existingMember) {
            // Update existing membership
            const { error: updateMemberError } = await supabase
              .from("group_members" as any)
              .update({ group_id: newCompanyId })
              .eq("email", editingAccount.email);

            if (updateMemberError) throw updateMemberError;
          } else {
            // Create new membership
            const { error: insertMemberError } = await supabase
              .from("group_members" as any)
              .insert({
                group_id: newCompanyId,
                name: editForm.name,
                surname: editForm.surname,
                email: editingAccount.email,
                access_rights: editForm.role === "hr" ? "company" : "employee",
              });

            if (insertMemberError) throw insertMemberError;
          }
        } else if (existingMember && !newCompanyId) {
          // Remove from company
          const { error: removeMemberError } = await supabase
            .from("group_members" as any)
            .delete()
            .eq("email", editingAccount.email);

          if (removeMemberError) throw removeMemberError;
        }
      } else if (newCompanyId && !editingAccount.email) {
        toast.error("Cannot assign company to user without email");
      }

      toast.success("Account updated successfully");
      setEditingAccount(null);
      fetchAccounts();
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account");
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      toast.error("User deletion requires admin API access");
      setDeletingAccount(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleResetProgress = async () => {
    if (!resettingAccount) return;

    try {
      // Delete all test results for this user from the database
      const { error } = await supabase
        .from("test_results")
        .delete()
        .eq("user_id", resettingAccount.user_id);

      if (error) throw error;

      toast.success(`Progress reset for ${resettingAccount.name} ${resettingAccount.surname}. They will need to retake all tests.`);
      setResettingAccount(null);
    } catch (error) {
      console.error("Error resetting progress:", error);
      toast.error("Failed to reset progress");
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) ||
      account.surname.toLowerCase().includes(query) ||
      account.email.toLowerCase().includes(query) ||
      account.role.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeVariant = (role: string, isAdmin: boolean) => {
    if (isAdmin) return "destructive";
    switch (role) {
      case "hr":
        return "default";
      case "employee":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string, isAdmin: boolean) => {
    if (isAdmin) return "Admin";
    if (role === "hr") return "Company";
    return "Employee";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="p-8">Loading accounts...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Accounts</h1>
        <p className="text-muted-foreground">Manage all user accounts</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Surname</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {account.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.surname}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(account.role, account.is_admin)}>
                        {getRoleLabel(account.role, account.is_admin)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.company_name || "-"}</TableCell>
                    <TableCell>{formatDate(account.last_sign_in)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setResettingAccount(account)}
                          title="Reset Progress"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingAccount(account)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={editForm.surname}
                onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">Company</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={editForm.company_id || "none"}
                onValueChange={(value) => setEditForm({ ...editForm, company_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No company assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company assigned</SelectItem>
                  {companyGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAccount(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for{" "}
              <strong>{deletingAccount?.name} {deletingAccount?.surname}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Progress Confirmation */}
      <AlertDialog open={!!resettingAccount} onOpenChange={() => setResettingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the test progress for{" "}
              <strong>{resettingAccount?.name} {resettingAccount?.surname}</strong>?
              This will clear all their test results and they will need to retake all assessments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetProgress}>
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Accounts;