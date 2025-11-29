import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  showBack?: boolean;
  showProfile?: boolean;
}

const NavBar = ({ showBack = true, showProfile = true }: NavBarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="w-10">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center - Meloria logo */}
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-bold hover:opacity-80 transition-opacity"
          style={{ color: '#282828' }}
        >
          MELORIA
        </button>

        {/* Right side - Profile icon */}
        <div className="w-10">
          {showProfile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/login")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
