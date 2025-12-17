import { useLocation, useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  Building2, 
  CreditCard, 
  Settings, 
  LogOut,
  Users,
  X
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
import { useLanguage } from "@/contexts/LanguageContext";

export function MeloriaSidebar() {
  const { open: sidebarOpen, toggleSidebar, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    { 
      title: t('meloria.questionnaires'), 
      url: "/meloria-admin/questionnaires", 
      icon: ClipboardList 
    },
    { 
      title: t('meloria.companyGroups'), 
      url: "/meloria-admin/company-groups", 
      icon: Building2 
    },
    { 
      title: t('meloria.accounts'), 
      url: "/meloria-admin/accounts", 
      icon: Users 
    },
    { 
      title: t('meloria.premiumPlans'), 
      url: "/meloria-admin/premium-plans", 
      icon: CreditCard 
    },
    { 
      title: t('meloria.settings'), 
      url: "/meloria-admin/settings", 
      icon: Settings 
    },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={sidebarOpen ? "w-60" : "w-14"} collapsible="icon">
      {/* Mobile close button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <span className="font-semibold">{t('meloria.menu')}</span>
        <button
          onClick={() => setOpenMobile(false)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop toggle button - hidden on mobile */}
      <div className="hidden md:flex items-center justify-end p-2 pt-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          {sidebarOpen ? (
            <span className="text-sm font-medium">&lt;&lt;</span>
          ) : (
            <span className="text-sm font-medium">&gt;&gt;</span>
          )}
        </button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('meloria.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                      onClick={handleNavClick}
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
                      {sidebarOpen && <span>{t('meloria.logOut')}</span>}
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('meloria.logOutConfirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('meloria.logOutDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        {t('meloria.logOut')}
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
