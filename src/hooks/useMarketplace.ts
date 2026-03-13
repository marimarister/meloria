import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildUserProfile,
  isEligible,
  scorePractice,
  groupPractices,
  type UserProfile,
  type ScoredPractice,
  type MarketplaceSection,
  type BurnoutScores,
  type PerceptionScores,
  type PreferenceScores,
  type Practice,
} from "@/lib/marketplace";

interface UseMarketplaceResult {
  sections: MarketplaceSection[];
  allScored: ScoredPractice[];
  profile: UserProfile | null;
  isLoading: boolean;
  isGated: boolean; // true if user hasn't completed all 3 tests
  error: string | null;
}

export function useMarketplace(): UseMarketplaceResult {
  const [sections, setSections] = useState<MarketplaceSection[]>([]);
  const [allScored, setAllScored] = useState<ScoredPractice[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGated, setIsGated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setIsLoading(false); return; }

      // Fetch test results
      const { data: results, error: rErr } = await supabase
        .from("test_results")
        .select("test_type, scores")
        .eq("user_id", user.id);

      if (rErr) throw rErr;

      const burnoutRow = results?.find(r => r.test_type === 'burnout');
      const perceptionRow = results?.find(r => r.test_type === 'perception');
      const preferenceRow = results?.find(r => r.test_type === 'preference');

      if (!burnoutRow || !perceptionRow || !preferenceRow) {
        setIsGated(true);
        setIsLoading(false);
        return;
      }

      const burnout = burnoutRow.scores as unknown as BurnoutScores;
      const perception = perceptionRow.scores as unknown as PerceptionScores;
      const preference = preferenceRow.scores as unknown as PreferenceScores;

      const userProfile = buildUserProfile(burnout, perception, preference);
      setProfile(userProfile);

      // Fetch active practices
      const { data: practices, error: pErr } = await supabase
        .from("practices")
        .select("*");

      if (pErr) throw pErr;

      const eligible = (practices as unknown as Practice[]).filter(p => isEligible(p, userProfile));
      const scored = eligible.map(p => scorePractice(p, userProfile));
      setAllScored(scored);
      setSections(groupPractices(scored, userProfile));
    } catch (err: any) {
      setError(err.message || "Failed to load marketplace");
    } finally {
      setIsLoading(false);
    }
  };

  return { sections, allScored, profile, isLoading, isGated, error };
}
