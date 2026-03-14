import { useState, useEffect, useCallback } from "react";
import { Wand2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordSuggestionProps {
  show: boolean;
  onAccept: (password: string) => void;
}

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*?";
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const mandatory = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;
  const rest = Array.from({ length: 12 }, () => pick(all));
  const combined = [...mandatory, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

const PasswordSuggestion = ({ show, onAccept }: PasswordSuggestionProps) => {
  const { t } = useLanguage();
  const [suggested, setSuggested] = useState("");

  useEffect(() => {
    if (show && !suggested) {
      setSuggested(generateStrongPassword());
    }
  }, [show, suggested]);

  const handleClick = useCallback(() => {
    onAccept(suggested);
    setSuggested("");
  }, [suggested, onAccept]);

  if (!show || !suggested) return null;

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent blur before click fires
        handleClick();
      }}
      className="absolute left-0 right-0 top-full mt-1 z-50 flex items-center gap-2 rounded-md border bg-popover p-2.5 text-sm shadow-md hover:bg-accent transition-colors cursor-pointer"
    >
      <Wand2 className="h-4 w-4 text-primary shrink-0" />
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-xs text-muted-foreground">{t('auth.suggestPassword')}</span>
        <span className="font-mono text-xs tracking-wide">{suggested}</span>
      </div>
    </button>
  );
};

export default PasswordSuggestion;
