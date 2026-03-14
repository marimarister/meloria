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

const fallbackImages: Record<string, string> = {
  online: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop",
  offline: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
  hybrid: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  default: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
};

/** Derive category tags from practice attributes */
export function getCategoryTags(practice: ScoredPractice): string[] {
  const tags: string[] = [];
  if (Number(practice.fit_k) >= 0.5) tags.push('physical');
  if (Number(practice.social_fit_group) >= 0.5) tags.push('social');
  if (Number(practice.targets_ee) >= 0.5 && practice.intensity !== 'intensive') tags.push('relaxation');
  if (Number(practice.fit_v) >= 0.5) tags.push('creative');
  if (Number(practice.fit_d) >= 0.5) tags.push('mental');
  if (Number(practice.fit_a) >= 0.5) tags.push('auditory');
  if (Number(practice.targets_dp) >= 0.5) tags.push('emotional');
  if (Number(practice.targets_pa) >= 0.5) tags.push('focus');
  return tags.slice(0, 4); // max 4 tags
}

const tagColors: Record<string, string> = {
  physical: 'bg-orange-100 text-orange-700 border-orange-200',
  social: 'bg-blue-100 text-blue-700 border-blue-200',
  relaxation: 'bg-teal-100 text-teal-700 border-teal-200',
  creative: 'bg-pink-100 text-pink-700 border-pink-200',
  mental: 'bg-purple-100 text-purple-700 border-purple-200',
  auditory: 'bg-green-100 text-green-700 border-green-200',
  emotional: 'bg-rose-100 text-rose-700 border-rose-200',
  focus: 'bg-amber-100 text-amber-700 border-amber-200',
};

export function PracticeCard({ practice, onAdd, disabledSlots, inCart }: PracticeCardProps) {
  const { t, language } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const title = (language === 'lv' && practice.title_lv) ? practice.title_lv : (language === 'ru' && practice.title_ru) ? practice.title_ru : practice.title;
  const description = (language === 'lv' && practice.description_lv) ? practice.description_lv : (language === 'ru' && practice.description_ru) ? practice.description_ru : practice.description;
  const formatLabel = practice.format ? practice.format.charAt(0).toUpperCase() + practice.format.slice(1) : '';
  const sampleSlots = useMemo(() => generateSampleSlots(practice.duration_minutes), [practice.duration_minutes]);
  const imageUrl = practice.image_url || fallbackImages[practice.format || 'default'] || fallbackImages.default;
  const categoryTags = useMemo(() => getCategoryTags(practice), [practice]);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="cursor-pointer h-[420px]"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ═══ FRONT — Original card style ═══ */}
        <div className="h-full" style={{ backfaceVisibility: "hidden" }}>
          <Card className="h-full p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight line-clamp-2">{title}</h3>
                {practice.provider && (
                  <p className="text-xs text-muted-foreground mt-0.5">{practice.provider}</p>
                )}
              </div>
            </div>

            {/* Category tags */}
            {categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categoryTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 border ${tagColors[tag] || 'bg-muted text-muted-foreground'}`}
                  >
                    {t(`marketplace.categories.${tag}`)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta row */}
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
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
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
                                ? 'bg-primary/10 text-primary/60 border-primary/20 cursor-not-allowed hover:bg-primary/10'
                                : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
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
                        <TooltipContent>{t('marketplace.slotFull')}</TooltipContent>
                      )}
                    </Tooltip>
                  );
                })
              )}
            </div>

            {/* Flip hint */}
            <button
              onClick={handleFlip}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              {t('catalog.flipToSeeDetails')}
            </button>
          </Card>
        </div>

        {/* ═══ BACK — Photo + brief description only ═══ */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full border border-border/50 overflow-hidden relative">
            {/* Full-bleed image */}
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            {/* Glass overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 backdrop-blur-sm bg-background/40 border-t border-white/15 p-5 pb-6 flex flex-col gap-2.5">
              <h3 className="font-semibold text-base leading-tight text-foreground">{title}</h3>

              {description && (
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{description}</p>
              )}

              {practice.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {practice.reasons.map((reason) => {
                    const Icon = reasonIcons[reason] || Star;
                    return (
                      <Badge key={reason} variant="outline" className="text-[10px] gap-1 px-1.5 py-0 bg-background/30 border-foreground/15 text-foreground/90 backdrop-blur-sm">
                        <Icon className="h-2.5 w-2.5" />
                        {t(`marketplace.reasons.${reason}`)}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleFlip}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline transition-colors mt-2"
              >
                <RotateCw className="w-3 h-3" />
                {t('catalog.flipBack')}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
