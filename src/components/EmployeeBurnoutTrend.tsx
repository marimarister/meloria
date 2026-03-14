import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export function EmployeeBurnoutTrend() {
  const { t } = useLanguage();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data } = await supabase
        .from("test_results")
        .select("scores, completed_at")
        .eq("user_id", user.id)
        .eq("test_type", "burnout")
        .order("completed_at", { ascending: true });

      setResults(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  const trendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; label: string; score: number | null }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString(undefined, { year: "2-digit", month: "short" });

      // Find the latest result in this month
      const monthResults = results.filter((r) => {
        const rd = new Date(r.completed_at);
        return rd >= d && rd < nextMonth;
      });

      if (monthResults.length === 0) {
        months.push({ month: key, label, score: null });
      } else {
        const latest = monthResults[monthResults.length - 1];
        const scores = latest.scores as any;
        const total = (scores?.emotionalExhaustion || 0) + (scores?.depersonalization || 0) + (scores?.personalAccomplishment || 0);
        months.push({ month: key, label, score: total });
      }
    }

    return months;
  }, [results]);

  const chartConfig: ChartConfig = {
    score: {
      label: t("employee.burnoutScore"),
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading || !trendData.some(d => d.score !== null)) return null;

  return (
    <Card className="p-6 mb-8 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{t("employee.burnoutTrend")}</h2>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis domain={[0, 132]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <ReferenceLine y={44} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" />
          <ReferenceLine y={88} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  if (payload?.[0]?.payload) {
                    const p = payload[0].payload;
                    const [y, mo] = p.month.split("-");
                    const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
                    return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
                  }
                  return "";
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
