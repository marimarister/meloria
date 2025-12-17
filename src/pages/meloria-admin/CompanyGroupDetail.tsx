import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Share2, RotateCcw, Download, Filter, Plus, Building2, Users, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TestResult {
  test_type: string;
  scores: any;
  completed_at: string;
}

interface GroupMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  access_rights: "employee" | "company";
  testResults?: TestResult[];
  burnoutScore?: number;
  burnoutLevel?: string;
}

interface Subgroup {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  service_type: string;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

type FilterOption = "all" | "completed" | "partial" | "none";

const CompanyGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState("");
  const [parentGroupId, setParentGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [activeTab, setActiveTab] = useState("members");
  
  // Event creation state
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createdEventQR, setCreatedEventQR] = useState<{ id: string; name: string } | null>(null);

  const inviteUrl = `${window.location.origin}/signup?group=${groupName.toLowerCase().replace(/\s+/g, "")}`;

  const getBurnoutLevel = (score: number): string => {
    if (score <= 22) return t('tests.burnout.perfectWellbeing');
    if (score <= 44) return t('tests.burnout.balancedResilient');
    if (score <= 66) return t('tests.burnout.mildFatigue');
    if (score <= 88) return t('tests.burnout.noticeableBurnout');
    if (score <= 110) return t('tests.burnout.severeBurnout');
    return t('tests.burnout.extremeBurnoutRisk');
  };

  const getBurnoutBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score <= 44) return "default";
    if (score <= 66) return "secondary";
    if (score <= 88) return "outline";
    return "destructive";
  };

  const getDominantChannel = (scores: any): string | null => {
    if (!scores) return null;
    const channelNames: Record<string, string> = {
      V: t('tests.perception.visual'),
      A: t('tests.perception.auditory'), 
      K: t('tests.perception.kinesthetic'),
      D: t('tests.perception.digital')
    };
    const channels = ['V', 'A', 'K', 'D'];
    let maxChannel = channels[0];
    let maxScore = scores[maxChannel] || 0;
    for (const channel of channels) {
      if ((scores[channel] || 0) > maxScore) {
        maxScore = scores[channel];
        maxChannel = channel;
      }
    }
    return maxScore > 0 ? channelNames[maxChannel] : null;
  };

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
      fetchEvents();
    }
  }, [id]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .eq("group_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const { data: group, error: groupError } = await supabase
        .from("company_groups" as any)
        .select("name, parent_group_id")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;

      setGroupName((group as any).name);
      setParentGroupId((group as any).parent_group_id);

      // Fetch subgroups (departments)
      const { data: subgroupsData, error: subgroupsError } = await supabase
        .from("company_groups" as any)
        .select(`
          id,
          name,
          description,
          service_type,
          group_members (id)
        `)
        .eq("parent_group_id", id);

      if (subgroupsError) throw subgroupsError;

      const formattedSubgroups: Subgroup[] = (subgroupsData as any[]).map(sg => ({
        id: sg.id,
        name: sg.name,
        description: sg.description,
        member_count: sg.group_members?.length || 0,
        service_type: sg.service_type || "free"
      }));

      setSubgroups(formattedSubgroups);

      const { data: memberData, error: membersError } = await supabase
        .from("group_members" as any)
        .select("*")
        .eq("group_id", id);

      if (membersError) throw membersError;

      const membersWithResults = await Promise.all(
        (memberData as any[]).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", member.email)
            .maybeSingle();

          if (profile) {
            const { data: testResults } = await supabase
              .from("test_results")
              .select("test_type, scores, completed_at")
              .eq("user_id", profile.id);

            const burnoutResult = testResults?.find((t: any) => t.test_type === "burnout");
            let burnoutScore: number | undefined;
            let burnoutLevel: string | undefined;

            if (burnoutResult?.scores) {
              const scores = burnoutResult.scores as any;
              burnoutScore = (scores.emotionalExhaustion || 0) + 
                            (scores.depersonalization || 0) + 
                            (scores.personalAccomplishment || 0);
              burnoutLevel = getBurnoutLevel(burnoutScore);
            }

            return {
              ...member,
              testResults: testResults || [],
              burnoutScore,
              burnoutLevel,
            };
          }

          return { ...member, testResults: [] };
        })
      );

      setMembers(membersWithResults);
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      toast.error(t('meloria.eventName'));
      return;
    }

    setCreatingEvent(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('common.error'));
        return;
      }

      // Create the event
      const { data: eventData, error: eventError } = await supabase
        .from("events" as any)
        .insert({
          name: eventName.trim(),
          description: eventDescription.trim() || null,
          group_id: id,
          created_by: user.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const eventId = (eventData as any).id;

      // Create invitations for all members
      const invitations = members.map(member => ({
        event_id: eventId,
        user_email: member.email
      }));

      if (invitations.length > 0) {
        const { error: invError } = await supabase
          .from("event_invitations" as any)
          .insert(invitations);

        if (invError) throw invError;
      }

      // Send emails via edge function
      const memberEmails = members.map(m => m.email);
      if (memberEmails.length > 0) {
        const { error: emailError } = await supabase.functions.invoke("send-event-invites", {
          body: {
            eventId,
            eventName: eventName.trim(),
            eventDescription: eventDescription.trim(),
            groupName,
            memberEmails
          }
        });

        if (emailError) {
          console.error("Error sending emails:", emailError);
          toast.warning(t('common.error'));
        } else {
          toast.success(t('meloria.invitesSent'));
        }
      } else {
        toast.success(t('common.success'));
      }

      // Show QR code
      setCreatedEventQR({ id: eventId, name: eventName.trim() });
      setEventName("");
      setEventDescription("");
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(t('common.error'));
    } finally {
      setCreatingEvent(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const testsCompleted = member.testResults?.length || 0;
    switch (filter) {
      case "completed":
        return testsCompleted === 3;
      case "partial":
        return testsCompleted > 0 && testsCompleted < 3;
      case "none":
        return testsCompleted === 0;
      default:
        return true;
    }
  });

  const exportToCSV = () => {
    const headers = [
      t('auth.name'),
      t('auth.surname'), 
      t('auth.email'),
      t('meloria.userRole'),
      t('company.testsCompleted'),
      t('tests.burnout.title'),
      t('tests.burnout.title') + " " + t('meloria.level'),
      t('tests.perception.title'),
      t('tests.preference.title')
    ];

    const rows = members.map((member) => {
      const channelTest = member.testResults?.find(t => t.test_type === "perception");
      const preferenceTest = member.testResults?.find(t => t.test_type === "preference");
      
      return [
        member.name,
        member.surname,
        member.email,
        member.access_rights === "employee" ? t('auth.imAnEmployee') : t('auth.imInCompany'),
        `${member.testResults?.length || 0}/3`,
        member.burnoutScore?.toString() || "N/A",
        member.burnoutLevel || t('common.noData'),
        getDominantChannel(channelTest?.scores) || t('common.noData'),
        (preferenceTest?.scores as any)?.archetype || t('common.noData')
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${groupName.toLowerCase().replace(/\s+/g, "-")}-test-results.csv`;
    link.click();
    toast.success(t('common.success'));
  };

  const handleResetProgress = async (memberEmail: string, memberName: string) => {
    if (!confirm(`${t('meloria.resetConfirm')} ${memberName}?`)) {
      return;
    }

    try {
      // First find the user's profile ID from their email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", memberEmail)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        toast.error(t('common.error'));
        return;
      }

      // Delete all test results for this user
      const { error: deleteError } = await supabase
        .from("test_results")
        .delete()
        .eq("user_id", profile.id);

      if (deleteError) throw deleteError;

      toast.success(t('common.success'));
      
      // Refresh the data
      fetchGroupDetails();
    } catch (error) {
      console.error("Error resetting progress:", error);
      toast.error(t('common.error'));
    }
  };

  const handleViewDashboard = (member: GroupMember, type: "employee" | "company") => {
    navigate(`/meloria-admin/view-dashboard/${member.id}/${type}`);
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success(t('meloria.linkCopied'));
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  const renderMemberCard = (member: GroupMember) => {
    const channelTest = member.testResults?.find(t => t.test_type === "perception");
    const preferenceTest = member.testResults?.find(t => t.test_type === "preference");
    const testsCompleted = member.testResults?.length || 0;
    const dominantChannel = getDominantChannel(channelTest?.scores);

    return (
      <Card key={member.id} className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">
                {member.name} {member.surname}
              </h3>
              <Badge variant="outline">
                {member.access_rights === "employee" ? t('auth.imAnEmployee') : t('auth.imInCompany')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
            
            <div className="flex flex-wrap gap-2">
              {member.burnoutLevel ? (
                <Badge variant={getBurnoutBadgeVariant(member.burnoutScore || 0)}>
                  {t('tests.burnout.title')}: {member.burnoutLevel} ({member.burnoutScore}/132)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  {t('tests.burnout.title')}: {t('common.noData')}
                </Badge>
              )}
              
              {dominantChannel ? (
                <Badge variant="secondary">
                  {t('tests.perception.title')}: {dominantChannel}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  {t('tests.perception.title')}: {t('common.noData')}
                </Badge>
              )}
              
              {preferenceTest ? (
                <Badge variant="secondary">
                  {t('tests.preference.title')}: {(preferenceTest.scores as any)?.archetype || t('common.complete')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  {t('tests.preference.title')}: {t('common.noData')}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              {t('company.testsCompleted')}: {testsCompleted}/3
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDashboard(member, member.access_rights === "employee" ? "employee" : "company")}
            >
              {t('meloria.viewDashboard')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResetProgress(member.email, `${member.name} ${member.surname}`)}
              title={t('meloria.resetProgress')}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => parentGroupId 
          ? navigate(`/meloria-admin/company-groups/${parentGroupId}`)
          : navigate("/meloria-admin/company-groups")
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.back')}
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{groupName}</h1>
          <p className="text-muted-foreground">
            {members.length} {t('meloria.groupMembers')}{subgroups.length > 0 ? ` • ${subgroups.length} ${t('meloria.subgroups')}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Create Event Button */}
          <Dialog open={eventDialogOpen} onOpenChange={(open) => {
            setEventDialogOpen(open);
            if (!open) {
              setCreatedEventQR(null);
              setEventName("");
              setEventDescription("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarPlus className="mr-2 h-4 w-4" />
                {t('meloria.createEvent')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('meloria.createEvent')}</DialogTitle>
                <DialogDescription>
                  {groupName}
                </DialogDescription>
              </DialogHeader>
              
              {createdEventQR ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('meloria.invitesSent')}
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG 
                        value={`${window.location.origin}/event/${createdEventQR.id}`} 
                        size={200} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('meloria.qrCode')}
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setCreatedEventQR(null);
                      setEventDialogOpen(false);
                    }}
                  >
                    {t('common.confirm')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-name">{t('meloria.eventName')} *</Label>
                    <Input
                      id="event-name"
                      placeholder={t('meloria.eventName')}
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">{t('meloria.eventDescription')}</Label>
                    <Textarea
                      id="event-description"
                      placeholder={t('meloria.eventDescription')}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {members.length} {t('meloria.groupMembers')}
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateEvent}
                    disabled={creatingEvent || !eventName.trim()}
                  >
                    {creatingEvent ? t('meloria.creating') : t('meloria.createEvent')}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          
          {!parentGroupId && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/meloria-admin/company-groups/create?parent=${id}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('meloria.addSubgroup')}
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="mr-2 h-4 w-4" />
                {t('meloria.inviteLink')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('meloria.inviteLink')}</DialogTitle>
                <DialogDescription>
                  {t('meloria.qrCode')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                  />
                  <Button size="sm" onClick={copyInviteUrl}>
                    {t('meloria.copyLink')}
                  </Button>
                </div>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value={inviteUrl} size={200} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Events Section */}
      {events.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('meloria.events')}</h2>
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{event.name}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {t('meloria.qrCode')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>{event.name}</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-4 bg-white rounded-lg">
                        <QRCodeSVG 
                          value={`${window.location.origin}/event/${event.id}`} 
                          size={200} 
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs for Departments and Members */}
      {subgroups.length > 0 || !parentGroupId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('meloria.groupMembers')} ({members.length})
            </TabsTrigger>
            {!parentGroupId && (
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('meloria.subgroups')} ({subgroups.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="departments" className="mt-6">
            {subgroups.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">{t('meloria.noSubgroups')}</p>
                <Button onClick={() => navigate(`/meloria-admin/company-groups/create?parent=${id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('meloria.addSubgroup')}
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subgroups.map((subgroup) => (
                  <Card
                    key={subgroup.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/meloria-admin/company-groups/${subgroup.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{subgroup.name}</h3>
                      <Badge variant={subgroup.service_type === "premium" ? "default" : "secondary"}>
                        {subgroup.service_type === "premium" ? t('meloria.premium') : t('meloria.free')}
                      </Badge>
                    </div>
                    {subgroup.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {subgroup.description}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t('meloria.groupMembers')}:</span>{" "}
                      <span className="font-medium">{subgroup.member_count}</span>
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            {/* Filter Section */}
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('common.search')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('company.allTests')}</SelectItem>
                  <SelectItem value="completed">{t('company.allTestsCompleted')}</SelectItem>
                  <SelectItem value="partial">{t('common.progress')}</SelectItem>
                  <SelectItem value="none">{t('common.noData')}</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filteredMembers.length} / {members.length}
              </span>
            </div>

            <div className="space-y-4">
              {filteredMembers.map(renderMemberCard)}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Filter Section for subgroups without tabs */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: FilterOption) => setFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('common.search')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('company.allTests')}</SelectItem>
                <SelectItem value="completed">{t('company.allTestsCompleted')}</SelectItem>
                <SelectItem value="partial">{t('common.progress')}</SelectItem>
                <SelectItem value="none">{t('common.noData')}</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredMembers.length} / {members.length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredMembers.map(renderMemberCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyGroupDetail;
