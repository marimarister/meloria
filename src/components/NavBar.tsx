import { ArrowLeft, User, Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

interface NavBarProps {
  showBack?: boolean;
  showProfile?: boolean;
}

const NavBar = ({
  showBack = false,
  showProfile = true
}: NavBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMeloriaAdmin, setIsMeloriaAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
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
        const role = session.user.user_metadata?.role;
        if (role) setUserRole(role);
        
        await fetchUserData(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const role = session.user.user_metadata?.role;
        if (role) setUserRole(role);
        
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: "Failed to log out. Please try again."
      });
    } else {
      toast({
        title: t('common.success'),
        description: "You have been successfully logged out."
      });
      navigate("/login");
    }
  };

  const navLinks = [
    { label: t('nav.ourStory'), href: "/our-story" },
    { label: t('nav.ourCatalog'), href: "/catalog" },
    { label: t('nav.contactUs'), href: "/contact" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-serif italic text-teal-800 hover:opacity-80 transition-opacity"
          >
            Meloria
          </button>
        </div>

        {/* Right side - Navigation Links + Language + Profile/Auth + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link, index) => (
              <div key={link.href} className="flex items-center gap-4">
                <Link
                  to={link.href}
                  className="text-sm italic text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="text-muted-foreground/50">|</span>
                )}
              </div>
            ))}
          </div>

          {/* Language Toggle - Desktop */}
          <div className="hidden md:block ml-4">
            <LanguageToggle />
          </div>

          {/* Desktop Profile/Auth */}
          <div className="hidden md:flex items-center gap-4">
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
                        {t('nav.myMeloriaDashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/meloria-admin/company-groups")}>
                        {t('nav.companyGroups')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/employee")}>
                        {t('nav.myEmployeeDashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/meloria-admin/settings")}>
                        {t('nav.settings')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        {t('nav.logOut')}
                      </DropdownMenuItem>
                    </>
                  ) : userRole === "employee" ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/employee")}>
                        {t('nav.myDashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/employee")}>
                        {t('nav.myTests')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t('nav.contactCompany')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('nav.settings')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        {t('nav.logOut')}
                      </DropdownMenuItem>
                    </>
                  ) : userRole === "hr" ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/company")}>
                        {t('nav.myCompanyDashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/employee")}>
                        {t('nav.myEmployeeDashboard')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/employee")}>
                        {t('nav.myTests')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t('nav.contactMeloria')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('nav.upgradeToPremium')}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t('nav.settings')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        {t('nav.logOut')}
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showProfile && !isAuthenticated && (
              <Button onClick={() => navigate("/login")}>
                {t('nav.signIn')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Language Toggle - Mobile */}
            <div className="py-2">
              <LanguageToggle />
            </div>
            
            <div className="border-t border-border pt-4">
              {showProfile && isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  {isMeloriaAdmin ? (
                    <>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate("/meloria-admin/questionnaires"); setMobileMenuOpen(false); }}>
                        {t('nav.myMeloriaDashboard')}
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate("/employee"); setMobileMenuOpen(false); }}>
                        {t('nav.myEmployeeDashboard')}
                      </Button>
                    </>
                  ) : userRole === "employee" ? (
                    <Button variant="ghost" className="justify-start" onClick={() => { navigate("/employee"); setMobileMenuOpen(false); }}>
                      {t('nav.myDashboard')}
                    </Button>
                  ) : userRole === "hr" ? (
                    <>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate("/company"); setMobileMenuOpen(false); }}>
                        {t('nav.myCompanyDashboard')}
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate("/employee"); setMobileMenuOpen(false); }}>
                        {t('nav.myEmployeeDashboard')}
                      </Button>
                    </>
                  ) : null}
                  <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    {t('nav.logOut')}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full">
                  {t('nav.signIn')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
