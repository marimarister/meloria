import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  showMenu?: boolean;
  showBack?: boolean;
}

const NavBar = ({ showMenu = false, showBack = false }: NavBarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="w-10">
          {showMenu && (
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center - Meloria logo */}
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          Meloria
        </button>

        {/* Right side - Profile icon */}
        <div className="w-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/login")}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
