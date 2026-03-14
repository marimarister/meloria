import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { t } = useLanguage();

  const checks = useMemo(() => [
    { key: "length", pass: password.length >= 8, label: t('auth.passwordRules.length') },
    { key: "uppercase", pass: /[A-Z]/.test(password), label: t('auth.passwordRules.uppercase') },
    { key: "lowercase", pass: /[a-z]/.test(password), label: t('auth.passwordRules.lowercase') },
    { key: "number", pass: /[0-9]/.test(password), label: t('auth.passwordRules.number') },
    { key: "special", pass: /[^A-Za-z0-9]/.test(password), label: t('auth.passwordRules.special') },
  ], [password, t]);

  const passedCount = checks.filter(c => c.pass).length;

  const strength = passedCount <= 2 ? "weak" : passedCount <= 3 ? "fair" : passedCount <= 4 ? "good" : "strong";
  const strengthLabel = t(`auth.passwordStrength.${strength}`);
  const strengthColors: Record<string, string> = {
    weak: "bg-destructive",
    fair: "bg-amber-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= Math.ceil((passedCount / 5) * 4)
                  ? strengthColors[strength]
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${
          strength === "weak" ? "text-destructive" :
          strength === "fair" ? "text-amber-600" :
          strength === "good" ? "text-blue-600" :
          "text-green-600"
        }`}>
          {strengthLabel}
        </span>
      </div>

      {/* Checklist */}
      <ul className="space-y-1">
        {checks.map((check) => (
          <li key={check.key} className="flex items-center gap-1.5 text-xs">
            {check.pass ? (
              <Check className="h-3 w-3 text-green-600 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <span className={check.pass ? "text-green-700" : "text-muted-foreground"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
