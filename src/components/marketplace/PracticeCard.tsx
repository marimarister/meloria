import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, MapPin, Star, Plus, Zap, Heart, Brain, Users } from "lucide-react";
import type { ScoredPractice } from "@/lib/marketplace";
import { useLanguage } from "@/contexts/LanguageContext";

interface PracticeCardProps {
  practice: ScoredPractice;
  onAdd: (practiceId: string, role: string) => void;
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

export function PracticeCard({ practice, onAdd, disabledSlots, inCart }: PracticeCardProps) {
  const { t, language } = useLanguage();

  const title = (language === 'lv' && practice.title_lv) ? practice.title_lv : practice.title;
  const description = (language === 'lv' && practice.description_lv) ? practice.description_lv : practice.description;

  const formatLabel = practice.format
    ? practice.format.charAt(0).toUpperCase() + practice.format.slice(1)
    : '';

  return (
    <Card className="p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">{title}</h3>
          {practice.provider && (
            <p className="text-xs text-muted-foreground mt-0.5">{practice.provider}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 font-mono text-xs">
          {(practice.compositeScore * 100).toFixed(0)}%
        </Badge>
      </div>

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
        {practice.price_credits > 0 && (
          <span className="font-medium text-foreground">{practice.price_credits} {t('marketplace.credits')}</span>
        )}
        {practice.price_credits === 0 && (
          <span className="text-primary font-medium">{t('marketplace.free')}</span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
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

      {/* Add to cart */}
      <div className="flex gap-2 mt-auto pt-1">
        {inCart ? (
          <Badge className="w-full justify-center py-1.5 bg-primary/10 text-primary border-primary/20" variant="outline">
            {t('marketplace.inCart')}
          </Badge>
        ) : (
          ['core', 'support', 'optional'].map((role) => {
            const disabled = disabledSlots.includes(role);
            return (
              <Tooltip key={role}>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      size="sm"
                      variant={role === 'core' ? 'default' : 'outline'}
                      className="w-full text-xs"
                      disabled={disabled}
                      onClick={() => onAdd(practice.id, role)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t(`marketplace.slot.${role}`)}
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
    </Card>
  );
}
