import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, MapPin } from "lucide-react";
import type { CartItem } from "@/hooks/useCart";
import { SLOT_LIMITS } from "@/lib/marketplace";
import { useLanguage } from "@/contexts/LanguageContext";

interface CartSlotProps {
  role: string;
  items: CartItem[];
  onRemove: (itemId: string) => void;
}

export function CartSlot({ role, items, onRemove }: CartSlotProps) {
  const { t, language } = useLanguage();
  const limit = SLOT_LIMITS[role] || 1;
  const filled = items.length;

  const getTitle = (item: CartItem) => {
    if (language === 'lv' && item.practice?.title_lv) return item.practice.title_lv;
    return item.practice?.title;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold capitalize">{t(`marketplace.slot.${role}`)}</h3>
        <Badge variant={filled >= limit ? "default" : "outline"} className="text-xs">
          {filled}/{limit}
        </Badge>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('marketplace.emptySlot')}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/40">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight">{getTitle(item)}</p>
                {item.practice?.provider && (
                  <p className="text-xs text-muted-foreground">{item.practice.provider}</p>
                )}
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  {item.practice?.format && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" /> {item.practice.format}
                    </span>
                  )}
                  {item.practice?.duration_minutes && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {item.practice.duration_minutes}m
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
