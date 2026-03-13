import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface MarketplaceFilterState {
  search: string;
  format: string;
  intensity: string;
  maxPrice: number;
}

const PRICE_MAX = 10;

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (filters: MarketplaceFilterState) => void;
}

export const defaultFilters: MarketplaceFilterState = {
  search: "",
  format: "all",
  intensity: "all",
  maxPrice: PRICE_MAX,
};

export function MarketplaceFilters({ filters, onChange }: MarketplaceFiltersProps) {
  const { t } = useLanguage();

  const update = (patch: Partial<MarketplaceFilterState>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search !== "" ||
    filters.format !== "all" ||
    filters.intensity !== "all" ||
    filters.maxPrice < PRICE_MAX;

  return (
    <div className="flex flex-col gap-3 mb-6 p-4 rounded-lg border bg-card animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('marketplace.filters.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Format */}
        <Select value={filters.format} onValueChange={(v) => update({ format: v })}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder={t('marketplace.filters.format')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('marketplace.filters.allFormats')}</SelectItem>
            <SelectItem value="online">{t('marketplace.filters.online')}</SelectItem>
            <SelectItem value="offline">{t('marketplace.filters.offline')}</SelectItem>
            <SelectItem value="hybrid">{t('marketplace.filters.hybrid')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Intensity */}
        <Select value={filters.intensity} onValueChange={(v) => update({ intensity: v })}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder={t('marketplace.filters.intensity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('marketplace.filters.allIntensities')}</SelectItem>
            <SelectItem value="soft">{t('marketplace.filters.soft')}</SelectItem>
            <SelectItem value="medium">{t('marketplace.filters.medium')}</SelectItem>
            <SelectItem value="intensive">{t('marketplace.filters.intensive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price slider */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t('marketplace.filters.maxPrice')}:
        </span>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={([v]) => update({ maxPrice: v })}
          max={PRICE_MAX}
          min={0}
          step={1}
          className="flex-1 max-w-xs"
        />
        <Badge variant="secondary" className="font-mono text-xs min-w-[60px] justify-center">
          {filters.maxPrice === PRICE_MAX
            ? t('marketplace.filters.any')
            : `≤ ${filters.maxPrice}`}
        </Badge>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange(defaultFilters)} className="ml-auto gap-1 text-xs">
            <X className="h-3 w-3" /> {t('marketplace.filters.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
