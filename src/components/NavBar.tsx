import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
interface NavBarProps {
  showBack?: boolean;
  showProfile?: boolean;
}
const NavBar = ({
  showBack = true,
  showProfile = true
}: NavBarProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMeloriaAdmin, setIsMeloriaAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      // Run both queries in parallel for faster loading
      const [adminResult] = await Promise.all([
        supabase
          .from("meloria_admins" as any)
          .select("id")
          .eq("user_id", userId)
          .maybeSingle()
      ]);
      
      setIsMeloriaAdmin(!!adminResult.data);
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        // Use role from user_metadata (faster)
        const role = session.user.user_metadata?.role;
        if (role) setUserRole(role);
        
        await fetchUserData(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        // Use role from user_metadata (faster)
        const role = session.user.user_metadata?.role;
        if (role) setUserRole(role);
        
        // Defer database calls to prevent deadlock
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsMeloriaAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again."
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate("/login");
    }
  };
  return <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="w-10">
          {showBack && <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>}
        </div>

        {/* Center - Meloria logo */}
        <button onClick={() => navigate("/")} style={{
        color: '#282828'
      }} className="text-2xl font-bold hover:opacity-80 transition-opacity font-serif">
          MELORIA
        </button>

        {/* Right side - Profile icon or Sign In */}
        <div className="w-auto">
          {showProfile && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isMeloriaAdmin ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/meloria-admin/questionnaires")}>
                      My Meloria Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/meloria-admin/company-groups")}>
                      Company Groups
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/employee")}>
                      My Employee Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/meloria-admin/settings")}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Log Out
                    </DropdownMenuItem>
                  </>
                ) : userRole === "employee" ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/employee")}>
                      My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/employee")}>
                      My Tests
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Contact Company</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Log Out
                    </DropdownMenuItem>
                  </>
                ) : userRole === "hr" ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/company")}>
                      My Company Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/employee")}>
                      My Employee Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/employee")}>
                      My Tests
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Contact Meloria</DropdownMenuItem>
                    <DropdownMenuItem>Upgrade to Premium</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Log Out
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showProfile && !isAuthenticated && (
            <Button onClick={() => navigate("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>;
};
export default NavBar;