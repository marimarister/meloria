import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MeloriaSidebar } from "@/components/MeloriaSidebar";
import NavBar from "@/components/NavBar";

const MeloriaDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    // Redirect to questionnaires if on base meloria-admin path
    if (location.pathname === "/meloria-admin") {
      navigate("/meloria-admin/questionnaires", { replace: true });
    }
  }, [location.pathname, navigate]);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("meloria_admins" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        toast.error("Access denied. You don't have permission to view this page.");
        navigate("/");
      }
    } catch (error) {
      console.error("Authorization check failed:", error);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <MeloriaSidebar />
          <main className="flex-1 overflow-auto">
            {/* Mobile burger menu trigger */}
            <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 p-4 bg-background border-b">
              <SidebarTrigger className="h-9 w-9" />
              <span className="font-semibold text-lg">Menu</span>
            </div>
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MeloriaDashboard;
