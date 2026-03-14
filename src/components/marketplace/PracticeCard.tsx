import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, MapPin, Star, Plus, Zap, Heart, Brain, Users, CalendarPlus, Lock, RotateCw } from "lucide-react";
import type { ScoredPractice } from "@/lib/marketplace";
import { useLanguage } from "@/contexts/LanguageContext";

interface PracticeCardProps {
  practice: ScoredPractice;
  onAdd: (practiceId: string, role: string, scheduledAt: string) => void;
  disabledSlots: string[];
  inCart: boolean;
}

const reasonIcons: Record<string, typeof Zap> = {
  burnoutMatch: Zap,
  helpsExhaustion: Heart,
  helpsConnection: Users,
  helpsAccomplishment: Star,
  matchesLearningStyle: Brain,
  matchesPreferences: Star,
};

/** Generate a few upcoming sample time slots based on practice duration */
function generateSampleSlots(durationMinutes: number | null): { label: string; dayOffset: number; hour: number }[] {
  const now = new Date();
  const slots: { label: string; dayOffset: number; hour: number }[] = [];

  const times = [
    { hour: 10, period: "10:00" },
    { hour: 14, period: "14:00" },
    { hour: 18, period: "18:00" },
  ];

  let daysAdded = 0;
  for (let offset = 1; daysAdded < 3 && offset < 10; offset++) {
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + offset);
    const dayOfWeek = futureDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const time = times[daysAdded % times.length];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const label = `${dayNames[dayOfWeek]}, ${monthNames[futureDate.getMonth()]} ${futureDate.getDate()} · ${time.period}`;
    slots.push({ label, dayOffset: offset, hour: time.hour });
    daysAdded++;
  }

  return slots;
}

// Fallback images by format type
const fallbackImages: Record<string, string> = {
  online: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
  offline: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
  hybrid: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  default: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
};

export function PracticeCard({ practice, onAdd, disabledSlots, inCart }: PracticeCardProps) {
  const { t, language } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const title = (language === 'lv' && practice.title_lv) ? practice.title_lv : (language === 'ru' && practice.title_ru) ? practice.title_ru : practice.title;
  const description = (language === 'lv' && practice.description_lv) ? practice.description_lv : (language === 'ru' && practice.description_ru) ? practice.description_ru : practice.description;

  const formatLabel = practice.format
    ? practice.format.charAt(0).toUpperCase() + practice.format.slice(1)
    : '';

  const sampleSlots = useMemo(() => generateSampleSlots(practice.duration_minutes), [practice.duration_minutes]);

  const imageUrl = practice.image_url || fallbackImages[practice.format || 'default'] || fallbackImages.default;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "1000px", minHeight: "340px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "340px",
        }}
      >
        {/* ═══ FRONT — Image with title overlay ═══ */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="h-full border border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative h-full">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{title}</h3>
                {practice.provider && (
                  <p className="text-sm text-white/80">{practice.provider}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {practice.format && (
                    <Badge className="text-[10px] bg-white/20 text-white border-0 backdrop-blur-sm">
                      <MapPin className="h-2.5 w-2.5 mr-0.5" /> {formatLabel}
                    </Badge>
                  )}
                  {practice.duration_minutes && (
                    <Badge className="text-[10px] bg-white/20 text-white border-0 backdrop-blur-sm">
                      <Clock className="h-2.5 w-2.5 mr-0.5" /> {practice.duration_minutes} {t('marketplace.min')}
                    </Badge>
                  )}
                  {practice.price_credits === 0 && (
                    <Badge className="text-[10px] bg-green-500/80 text-white border-0">{t('marketplace.free')}</Badge>
                  )}
                </div>
                {/* Reasons */}
                {practice.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {practice.reasons.slice(0, 3).map((reason) => {
                      const Icon = reasonIcons[reason] || Star;
                      return (
                        <Badge key={reason} className="text-[9px] gap-0.5 px-1.5 py-0 bg-white/15 text-white/90 border-0 backdrop-blur-sm">
                          <Icon className="h-2.5 w-2.5" />
                          {t(`marketplace.reasons.${reason}`)}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={handleFlip}
                  className="text-xs text-white/80 mt-2 flex items-center gap-1 hover:text-white transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  {t('catalog.flipToSeeDetails')}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══ BACK — Details + time slots + add buttons ═══ */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full border border-border/50 p-4 flex flex-col gap-2.5 overflow-y-auto">
            {/* Image strip */}
            <div className="h-24 rounded-lg overflow-hidden shrink-0">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <h3 className="font-semibold text-base leading-tight line-clamp-2">{title}</h3>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {practice.format && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {formatLabel}
                </span>
              )}
              {practice.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {practice.duration_minutes} {t('marketplace.min')}
                </span>
              )}
              {practice.intensity && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {practice.intensity}
                </Badge>
              )}
              {practice.price_credits > 0 && (
                <span className="font-medium text-foreground">{practice.price_credits} {t('marketplace.credits')}</span>
              )}
              {practice.price_credits === 0 && (
                <span className="text-primary font-medium">{t('marketplace.free')}</span>
              )}
            </div>

            {/* Full description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}

            {/* Reasons */}
            {practice.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {practice.reasons.map((reason) => {
                  const Icon = reasonIcons[reason] || Star;
                  return (
                    <Badge key={reason} variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-primary/5 border-primary/20 text-primary">
                      <Icon className="h-2.5 w-2.5" />
                      {t(`marketplace.reasons.${reason}`)}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Sample date/time slots */}
            {!inCart && (
              <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <CalendarPlus className="h-3 w-3" />
                  {t('marketplace.availableTimes')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {sampleSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSlot(selectedSlot === idx ? null : idx);
                      }}
                      className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                        selectedSlot === idx
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-1" onClick={(e) => e.stopPropagation()}>
              {inCart ? (
                <Badge className="w-full justify-center py-1.5 bg-primary/10 text-primary border-primary/20" variant="outline">
                  {t('marketplace.inCart')}
                </Badge>
              ) : selectedSlot === null ? (
                <p className="w-full text-center text-[11px] text-amber-600 font-medium py-1.5">
                  {t('marketplace.selectTimeFirst')}
                </p>
              ) : (
                ['core', 'support', 'optional'].map((role) => {
                  const disabled = disabledSlots.includes(role);
                  const slot = sampleSlots[selectedSlot];
                  const scheduledDate = new Date();
                  scheduledDate.setDate(scheduledDate.getDate() + slot.dayOffset);
                  scheduledDate.setHours(slot.hour, 0, 0, 0);

                  return (
                    <Tooltip key={role}>
                      <TooltipTrigger asChild>
                        <span className="flex-1 min-w-[80px]">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`w-full text-[11px] px-2 truncate ${
                              disabled
                                ? 'bg-green-500/10 text-green-700 border-green-300 cursor-not-allowed hover:bg-green-500/10'
                                : 'hover:bg-green-500 hover:text-white hover:border-green-500'
                            }`}
                            disabled={disabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdd(practice.id, role, scheduledDate.toISOString());
                            }}
                          >
                            {disabled ? (
                              <Lock className="h-3 w-3 mr-0.5 shrink-0" />
                            ) : (
                              <Plus className="h-3 w-3 mr-0.5 shrink-0" />
                            )}
                            <span className="truncate">{t(`marketplace.slot.${role}`)}</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {disabled && (
                        <TooltipContent>
                          {t('marketplace.slotFull')}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })
              )}
            </div>

            {/* Flip back button */}
            <button
              onClick={handleFlip}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              {t('catalog.flipBack')}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
