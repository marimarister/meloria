import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPeriodStart, SLOT_LIMITS } from "@/lib/marketplace";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  user_id: string;
  practice_id: string;
  cart_role: string;
  period_start: string;
  added_at: string;
  scheduled_at: string | null;
  practice?: {
    id: string;
    title: string;
    title_lv: string | null;
    title_ru: string | null;
    provider: string | null;
    format: string | null;
    duration_minutes: number | null;
    price_credits: number;
  };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const periodStart = getCurrentPeriodStart();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("period_start", periodStart);

    if (error) { console.error(error); return; }

    // Fetch practice details for each item
    const enriched = await Promise.all(
      (data as any[] || []).map(async (item: any) => {
        const { data: practice } = await supabase
          .from("practices" as any)
          .select("id, title, title_lv, title_ru, provider, format, duration_minutes, price_credits")
          .eq("id", item.practice_id)
          .single();
        return { ...item, practice } as CartItem;
      })
    );

    setItems(enriched);
    setIsLoading(false);
  }, [periodStart]);

  useEffect(() => { load(); }, [load]);

  const slotCounts = items.reduce((acc, item) => {
    acc[item.cart_role] = (acc[item.cart_role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isSlotFull = (role: string) => (slotCounts[role] || 0) >= (SLOT_LIMITS[role] || 1);

  const addToCart = async (practiceId: string, role: string, scheduledAt?: string): Promise<boolean> => {
    if (isSlotFull(role)) {
      toast.error(`The ${role} slot is already filled for this period.`);
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("cart_items" as any)
      .insert({
        user_id: user.id,
        practice_id: practiceId,
        cart_role: role,
        period_start: periodStart,
        scheduled_at: scheduledAt || null,
      } as any);

    if (error) {
      if (error.code === '23505') {
        toast.error("This practice is already in your cart for this period.");
      } else {
        toast.error(error.message);
      }
      return false;
    }

    toast.success("Added to your wellness plan!");
    await load();
    return true;
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from("cart_items" as any)
      .delete()
      .eq("id", itemId);

    if (error) { toast.error(error.message); return; }
    toast.success("Removed from your wellness plan.");
    await load();
  };

  return { items, isLoading, periodStart, slotCounts, isSlotFull, addToCart, removeFromCart };
}
