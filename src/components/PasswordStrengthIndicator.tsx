import { Check, X, Wand2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface PasswordStrengthIndicatorProps {
  password: string;
  onSuggest?: (password: string) => void;
}

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*?";

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  // Guarantee at least one of each category
  const mandatory = [pick(upper), pick(lower), pick(digits), pick(special)];

  const all = upper + lower + digits + special;
  const rest = Array.from({ length: 12 }, () => pick(all));

  // Shuffle
  const combined = [...mandatory, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}

const PasswordStrengthIndicator = ({ password, onSuggest }: PasswordStrengthIndicatorProps) => {
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

  const handleSuggest = useCallback(() => {
    if (onSuggest) {
      onSuggest(generateStrongPassword());
    }
  }, [onSuggest]);

  return (
    <div className="space-y-2 mt-2">
      {/* Suggest button */}
      {onSuggest && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          className="h-7 text-xs gap-1.5"
        >
          <Wand2 className="h-3 w-3" />
          {t('auth.suggestPassword')}
        </Button>
      )}

      {password && (
        <>
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
        </>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
