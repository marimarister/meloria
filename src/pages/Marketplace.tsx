import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import NavBar from "@/components/NavBar";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useCart } from "@/hooks/useCart";
import { MarketplaceSectionComponent } from "@/components/marketplace/MarketplaceSection";
import { MarketplaceFilters, defaultFilters, type MarketplaceFilterState } from "@/components/marketplace/MarketplaceFilters";
import { getCategoryTags } from "@/components/marketplace/PracticeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Loader2, AlertTriangle, Star, Shield, Sparkles, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SLOT_LIMITS } from "@/lib/marketplace";
import type { ScoredPractice, MarketplaceSection } from "@/lib/marketplace";

const Marketplace = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { sections, isLoading: mpLoading, isGated, error } = useMarketplace();
  const { items, isLoading: cartLoading, slotCounts, isSlotFull, addToCart, removeFromCart, periodLabel } = useCart();

  useEffect(() => {
    if (isGated && !mpLoading) {
      navigate("/employee");
    }
  }, [isGated, mpLoading, navigate]);

  const [filters, setFilters] = useState<MarketplaceFilterState>(defaultFilters);

  const cartPracticeIds = items.map(i => i.practice_id);
  const disabledSlots = Object.keys(SLOT_LIMITS).filter(role => isSlotFull(role));
  const totalCartItems = items.length;

  const filteredSections = useMemo(() => {
    const matchesFilter = (p: ScoredPractice) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q) || p.title_lv?.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q) || p.description_lv?.toLowerCase().includes(q);
        const inProvider = p.provider?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inProvider) return false;
      }
      if (filters.format !== "all" && p.format !== filters.format) return false;
      if (filters.intensity !== "all" && p.intensity !== filters.intensity) return false;
      
      return true;
    };

    return sections
      .map((s): MarketplaceSection => ({
        key: s.key,
        practices: s.practices.filter(matchesFilter),
      }))
      .filter((s) => s.practices.length > 0);
  }, [sections, filters]);

  if (mpLoading || cartLoading) {
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/employee")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('marketplace.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate("/employee")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('marketplace.backToDashboard')}
            </Button>
            <h1 className="text-3xl font-bold">{t('marketplace.title')}</h1>
            <p className="text-muted-foreground">{t('marketplace.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {t('marketplace.period')}: {periodLabel}
            </Badge>
            <Button variant="outline" onClick={() => navigate("/marketplace/cart")} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t('marketplace.myPlan')}
              {totalCartItems > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {totalCartItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Slot explanation */}
        <Card className="p-5 mb-6 animate-fade-in">
          <h3 className="font-semibold text-sm mb-2">{t('marketplace.slotExplanation.title')}</h3>
          <p className="text-sm text-muted-foreground mb-3">{t('marketplace.slotExplanation.intro')}</p>
          <p className="text-sm font-medium mb-3">{t('marketplace.slotExplanation.instruction')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex gap-2.5">
              <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('marketplace.slot.core')}</p>
                <p className="text-xs text-muted-foreground">{t('marketplace.slotExplanation.core')}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('marketplace.slot.support')}</p>
                <p className="text-xs text-muted-foreground">{t('marketplace.slotExplanation.support')}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('marketplace.slot.optional')}</p>
                <p className="text-xs text-muted-foreground">{t('marketplace.slotExplanation.optional')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <MarketplaceFilters filters={filters} onChange={setFilters} />

        {/* Chosen practices summary */}
        {items.length > 0 && (
          <Card className="p-4 mb-6 animate-fade-in border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">{t('marketplace.myPlan')}</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {items.length}/3
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['core', 'support', 'optional'] as const).map((slot) => {
                const item = items.find(i => i.cart_role === slot);
                const SlotIcon = slot === 'core' ? Star : slot === 'support' ? Shield : Sparkles;
                const practiceTitle = item?.practice
                  ? (language === 'lv' && item.practice.title_lv) ? item.practice.title_lv
                    : (language === 'ru' && item.practice.title_ru) ? item.practice.title_ru
                    : item.practice.title
                  : null;

                return (
                  <div
                    key={slot}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm ${
                      item
                        ? 'bg-background border-primary/30'
                        : 'bg-muted/30 border-dashed border-border'
                    }`}
                  >
                    <SlotIcon className={`h-3.5 w-3.5 shrink-0 ${item ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {t(`marketplace.slot.${slot}`)}
                      </p>
                      {item && practiceTitle ? (
                        <p className="text-xs font-medium truncate">{practiceTitle}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">{t('marketplace.emptySlot')}</p>
                      )}
                    </div>
                    {item && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Empty state */}
        {filteredSections.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">{t('marketplace.noPractices')}</p>
          </Card>
        )}

        {/* Sections */}
        {filteredSections.map((section) => (
          <MarketplaceSectionComponent
            key={section.key}
            sectionKey={section.key}
            practices={section.practices}
            onAdd={addToCart}
            disabledSlots={disabledSlots}
            cartPracticeIds={cartPracticeIds}
          />
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
