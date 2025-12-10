import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  surname: z.string().trim().min(1, "Surname is required").max(100, "Surname must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupSlug = searchParams.get("group");
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (role: "employee" | "hr") => {
    // Validate all inputs using zod schema
    const validationResult = signupSchema.safeParse({
      name,
      surname,
      email,
      password,
      confirmPassword,
      agreedToTerms,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: validationResult.data.name,
            surname: validationResult.data.surname,
            role,
            group_slug: groupSlug || undefined,
          },
        },
      });

      if (error) throw error;

      // Send custom confirmation email via edge function
      if (data.user) {
        const confirmationUrl = `${window.location.origin}/login?confirmed=true`;
        
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: validationResult.data.email,
              name: validationResult.data.name,
              confirmationUrl,
            },
          });
          console.log("Confirmation email sent successfully");
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't block signup if email fails - Supabase will send its own
        }
      }

      toast({
        title: "Success!",
        description: "Your account has been created. Please check your email to confirm.",
      });

      setShowVerification(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="surname">Surname <span className="text-destructive">*</span></Label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Doe"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
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
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
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
                Agree to the terms and conditions <span className="text-destructive">*</span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => handleRegister("employee")}
                className="flex-1"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "I'm an Employee"}
              </Button>
            <Button
              type="button"
              onClick={() => handleRegister("hr")}
              className="flex-1"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "I'm in Company"}
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