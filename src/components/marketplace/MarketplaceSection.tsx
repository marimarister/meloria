import type { ScoredPractice } from "@/lib/marketplace";
import { PracticeCard } from "./PracticeCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface MarketplaceSectionProps {
  sectionKey: string;
  practices: ScoredPractice[];
  onAdd: (practiceId: string, role: string, scheduledAt: string) => void;
  disabledSlots: string[];
  cartPracticeIds: string[];
}

export function MarketplaceSectionComponent({
  sectionKey,
  practices,
  onAdd,
  disabledSlots,
  cartPracticeIds,
}: MarketplaceSectionProps) {
  const { t } = useLanguage();

  if (practices.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{t(`marketplace.sections.${sectionKey}`)}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {practices.map((practice) => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            onAdd={onAdd}
            disabledSlots={disabledSlots}
            inCart={cartPracticeIds.includes(practice.id)}
          />
        ))}
      </div>
    </section>
  );
}
