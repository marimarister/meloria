import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";

const MeloriaSettings = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [profile, setProfile] = useState({ name: "", surname: "", email: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, surname")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name,
          surname: data.surname,
          email: user.email || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success(t('meloria.updatePassword') + " ✓");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('meloria.settingsTitle')}</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('meloria.personalInfo')}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('auth.name')}</Label>
                <Input value={profile.name} disabled />
              </div>
              <div>
                <Label>{t('auth.surname')}</Label>
                <Input value={profile.surname} disabled />
              </div>
            </div>
            <div>
              <Label>{t('auth.email')}</Label>
              <Input value={profile.email} disabled />
            </div>
            <div>
              <Label>{t('meloria.accountType')}</Label>
              <Input value={t('meloria.meloriaAdmin')} disabled />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('meloria.changePassword')}</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">{t('meloria.currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword">{t('meloria.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t('meloria.confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange}>{t('meloria.updatePassword')}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('meloria.appearance')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('meloria.darkMode')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('meloria.theme')}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MeloriaSettings;
