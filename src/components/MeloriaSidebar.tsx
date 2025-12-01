import { useLocation, useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  Building2, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { 
    title: "Questionnaires", 
    url: "/meloria-admin/questionnaires", 
    icon: ClipboardList 
  },
  { 
    title: "Company Groups", 
    url: "/meloria-admin/company-groups", 
    icon: Building2 
  },
  { 
    title: "Premium Plans", 
    url: "/meloria-admin/premium-plans", 
    icon: CreditCard 
  },
  { 
    title: "Settings", 
    url: "/meloria-admin/settings", 
    icon: Settings 
  },
];

export function MeloriaSidebar() {
  const { open: sidebarOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={sidebarOpen ? "w-60" : "w-14"} collapsible="icon">
      <div className="flex items-center justify-end p-2">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className={sidebarOpen ? "mr-2 h-4 w-4" : "h-4 w-4"} />
                      {sidebarOpen && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50 text-destructive hover:text-destructive">
                      <LogOut className={sidebarOpen ? "mr-2 h-4 w-4" : "h-4 w-4"} />
                      {sidebarOpen && <span>Log out</span>}
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        Log out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
