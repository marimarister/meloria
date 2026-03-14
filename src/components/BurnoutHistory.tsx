import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingDown,
  TrendingUp,
  Activity,
  Minus,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MonthlyBurnoutData {
  month: string; // YYYY-MM
  avgScore: number;
  totalTests: number;
  riskCategories: { low: number; moderate: number; high: number };
}

interface BurnoutHistoryProps {
  memberUserIds: string[];
}

const getBurnoutRiskCategory = (score: number): "low" | "moderate" | "high" => {
  if (score <= 44) return "low";
  if (score <= 88) return "moderate";
  return "high";
};

export function BurnoutHistory({ memberUserIds }: BurnoutHistoryProps) {
  const { t } = useLanguage();
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected month as Date (first day of month)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const fetchAll = async () => {
      if (memberUserIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("test_results")
        .select("user_id, test_type, scores, completed_at")
        .eq("test_type", "burnout")
        .in("user_id", memberUserIds)
        .order("completed_at", { ascending: true });

      setAllResults(data || []);
      setIsLoading(false);
    };
    fetchAll();
  }, [memberUserIds]);

  // Get available months from data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allResults.forEach((r) => {
      const d = new Date(r.completed_at);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort();
  }, [allResults]);

  const selectedKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;

  // Compute stats for selected month
  const monthData = useMemo((): MonthlyBurnoutData | null => {
    const monthResults = allResults.filter((r) => {
      const d = new Date(r.completed_at);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth()
      );
    });

    if (monthResults.length === 0) return null;

    // For each user, take only the latest result in that month
    const latestPerUser: Record<string, any> = {};
    monthResults.forEach((r) => {
      if (
        !latestPerUser[r.user_id] ||
        new Date(r.completed_at) > new Date(latestPerUser[r.user_id].completed_at)
      ) {
        latestPerUser[r.user_id] = r;
      }
    });

    const entries = Object.values(latestPerUser);
    let totalScore = 0;
    const risk = { low: 0, moderate: 0, high: 0 };

    entries.forEach((r: any) => {
      const scores = r.scores;
      const total =
        (scores?.emotionalExhaustion || 0) +
        (scores?.depersonalization || 0) +
        (scores?.personalAccomplishment || 0);
      totalScore += total;
      risk[getBurnoutRiskCategory(total)]++;
    });

    return {
      month: selectedKey,
      avgScore: Math.round(totalScore / entries.length),
      totalTests: entries.length,
      riskCategories: risk,
    };
  }, [allResults, selectedDate, selectedKey]);

  // Previous month data for comparison
  const prevMonthData = useMemo((): MonthlyBurnoutData | null => {
    const prevDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const prevResults = allResults.filter((r) => {
      const d = new Date(r.completed_at);
      return d.getFullYear() === prevDate.getFullYear() && d.getMonth() === prevDate.getMonth();
    });

    if (prevResults.length === 0) return null;

    const latestPerUser: Record<string, any> = {};
    prevResults.forEach((r) => {
      if (!latestPerUser[r.user_id] || new Date(r.completed_at) > new Date(latestPerUser[r.user_id].completed_at)) {
        latestPerUser[r.user_id] = r;
      }
    });

    const entries = Object.values(latestPerUser);
    let totalScore = 0;
    const risk = { low: 0, moderate: 0, high: 0 };
    entries.forEach((r: any) => {
      const scores = r.scores;
      const total = (scores?.emotionalExhaustion || 0) + (scores?.depersonalization || 0) + (scores?.personalAccomplishment || 0);
      totalScore += total;
      risk[getBurnoutRiskCategory(total)]++;
    });

    return {
      month: `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`,
      avgScore: Math.round(totalScore / entries.length),
      totalTests: entries.length,
      riskCategories: risk,
    };
  }, [allResults, selectedDate]);

  const goToPrev = () => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goToNext = () => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const isCurrentMonth =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth();

  const monthLabel = selectedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  const scoreDiff = monthData && prevMonthData ? monthData.avgScore - prevMonthData.avgScore : null;

  // Compute trend data for all available months
  const trendData = useMemo(() => {
    return availableMonths.map((m) => {
      const [y, mo] = m.split("-");
      const monthDate = new Date(parseInt(y), parseInt(mo) - 1, 1);
      const monthResults = allResults.filter((r) => {
        const d = new Date(r.completed_at);
        return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
      });

      const latestPerUser: Record<string, any> = {};
      monthResults.forEach((r) => {
        if (!latestPerUser[r.user_id] || new Date(r.completed_at) > new Date(latestPerUser[r.user_id].completed_at)) {
          latestPerUser[r.user_id] = r;
        }
      });

      const entries = Object.values(latestPerUser);
      let totalScore = 0;
      entries.forEach((r: any) => {
        const scores = r.scores;
        totalScore += (scores?.emotionalExhaustion || 0) + (scores?.depersonalization || 0) + (scores?.personalAccomplishment || 0);
      });

      const label = monthDate.toLocaleDateString(undefined, { year: "2-digit", month: "short" });
      return {
        month: m,
        label,
        avgScore: entries.length > 0 ? Math.round(totalScore / entries.length) : 0,
        employees: entries.length,
      };
    });
  }, [allResults, availableMonths]);

  const trendChartConfig: ChartConfig = {
    avgScore: {
      label: t("company.averageBurnoutScore"),
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) return null;

  return (
    <Card className="p-6 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">{t("company.burnoutHistory")}</h2>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={selectedKey}
            onValueChange={(val) => {
              const [y, m] = val.split("-");
              setSelectedDate(new Date(parseInt(y), parseInt(m) - 1, 1));
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue>{monthLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableMonths.length > 0 ? (
                availableMonths.map((m) => {
                  const [y, mo] = m.split("-");
                  const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
                  return (
                    <SelectItem key={m} value={m}>
                      {d.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value={selectedKey}>{monthLabel}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNext}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!monthData ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t("company.noDataForMonth")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary row */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Avg score */}
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{t("company.averageBurnoutScore")}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{monthData.avgScore}</span>
                <span className="text-muted-foreground">/132</span>
              </div>
              {scoreDiff !== null && (
                <div
                  className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                    scoreDiff < 0 ? "text-green-600" : scoreDiff > 0 ? "text-red-600" : "text-muted-foreground"
                  }`}
                >
                  {scoreDiff < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      {Math.abs(scoreDiff)} {t("company.pointsLower")}
                    </>
                  ) : scoreDiff > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      {scoreDiff} {t("company.pointsHigher")}
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3" />
                      {t("company.noChangeFromPrev")}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tests taken */}
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{t("company.testsThisMonth")}</p>
              <span className="text-3xl font-bold">{monthData.totalTests}</span>
              <p className="text-xs text-muted-foreground mt-1">
                {t("company.employeesAssessed")}
              </p>
            </div>

            {/* Risk change */}
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{t("company.highRisk")}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-destructive">
                  {monthData.riskCategories.high}
                </span>
                {prevMonthData && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      monthData.riskCategories.high < prevMonthData.riskCategories.high
                        ? "text-green-600 border-green-300"
                        : monthData.riskCategories.high > prevMonthData.riskCategories.high
                        ? "text-red-600 border-red-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    {monthData.riskCategories.high < prevMonthData.riskCategories.high
                      ? `↓ ${prevMonthData.riskCategories.high - monthData.riskCategories.high}`
                      : monthData.riskCategories.high > prevMonthData.riskCategories.high
                      ? `↑ ${monthData.riskCategories.high - prevMonthData.riskCategories.high}`
                      : "—"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {monthData.riskCategories.high === 1
                  ? t("company.employeeNeedsAttention")
                  : t("company.employeesNeedAttention")}
              </p>
            </div>
          </div>

          {/* Risk distribution bars */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t("company.riskDistribution")}</h3>
            {(["low", "moderate", "high"] as const).map((level) => {
              const count = monthData.riskCategories[level];
              const pct = monthData.totalTests > 0 ? (count / monthData.totalTests) * 100 : 0;
              const icons = { low: TrendingDown, moderate: Activity, high: TrendingUp };
              const colors = { low: "text-green-600", moderate: "text-amber-600", high: "text-destructive" };
              const Icon = icons[level];
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${colors[level]}`} />
                      <span className="text-sm font-medium">{t(`company.${level}Risk`)}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length >= 2 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("company.burnoutTrend")}</h3>
          </div>
          <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 132]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <ReferenceLine y={44} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" label={{ value: t("company.lowRisk"), position: "right", fill: "hsl(142, 71%, 45%)", fontSize: 10 }} />
              <ReferenceLine y={88} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" label={{ value: t("company.moderateRisk"), position: "right", fill: "hsl(38, 92%, 50%)", fontSize: 10 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload?.[0]?.payload) {
                        const p = payload[0].payload;
                        const [y, mo] = p.month.split("-");
                        const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
                        return `${d.toLocaleDateString(undefined, { year: "numeric", month: "long" })} · ${p.employees} ${t("company.employeesAssessed")}`;
                      }
                      return "";
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </Card>
  );
}
