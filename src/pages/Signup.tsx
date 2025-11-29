import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { UserPlus } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleRegister = (role: "employee" | "hr") => {
    // TODO: Implement actual registration
    console.log("Registration attempt:", { name, surname, email, personalId, role });
    setShowVerification(true);
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <div className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md p-8 animate-fade-in text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
            <p className="text-muted-foreground mb-8">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>

            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
            >
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-muted-foreground mb-8">
            Join Meloria today
          </p>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                type="text"
                placeholder="Doe"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalId">Personal ID</Label>
              <Input
                id="personalId"
                type="text"
                placeholder="Enter your personal ID"
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Agree to the terms and conditions
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => handleRegister("employee")}
                className="flex-1"
                size="lg"
                disabled={!agreedToTerms}
              >
                Register as Employee
              </Button>
              <Button
                type="button"
                onClick={() => handleRegister("hr")}
                className="flex-1"
                size="lg"
                disabled={!agreedToTerms}
              >
                Register as HR
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
