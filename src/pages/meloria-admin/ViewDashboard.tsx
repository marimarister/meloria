import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Brain, ClipboardCheck, Check, Clock, Eye, Volume2, Hand, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface TestResults {
  burnout: { completed: boolean; score: number | null; scores: any };
  perception: { completed: boolean; scores: any };
  preference: { completed: boolean; scores: any };
}

const ViewDashboard = () => {
  const { memberId, dashboardType } = useParams<{ memberId: string; dashboardType: "employee" | "company" }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [member, setMember] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResults>({
    burnout: { completed: false, score: null, scores: null },
    perception: { completed: false, scores: null },
    preference: { completed: false, scores: null },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      fetchMemberAndResults();
    }
  }, [memberId]);

  const fetchMemberAndResults = async () => {
    try {
      // Get member details
      const { data: memberData, error: memberError } = await supabase
        .from("group_members" as any)
        .select("*")
        .eq("id", memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Find the user_id by matching email with profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", (memberData as any).email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        // Fetch test results for this user
        const { data: results, error: resultsError } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", profileData.id);

        if (resultsError) throw resultsError;

        const burnoutData = results?.find(r => r.test_type === 'burnout');
        const perceptionData = results?.find(r => r.test_type === 'perception');
        const preferenceData = results?.find(r => r.test_type === 'preference');

        setTestResults({
          burnout: {
            completed: !!burnoutData,
            score: burnoutData ? (burnoutData.scores as any).total : null,
            scores: burnoutData?.scores,
          },
          perception: {
            completed: !!perceptionData,
            scores: perceptionData?.scores,
          },
          preference: {
            completed: !!preferenceData,
            scores: preferenceData?.scores,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    let progress = 0;
    if (testResults.burnout.completed) {
      if (testResults.burnout.score !== null && testResults.burnout.score <= 44) {
        return 100;
      }
      progress += 40;
      if (testResults.perception.completed) progress += 30;
      if (testResults.preference.completed) progress += 30;
    }
    return progress;
  };

  const getBurnoutLevel = (score: number) => {
    if (score <= 22) return t("tests.burnout.perfectWellbeing");
    if (score <= 44) return t("tests.burnout.balancedResilient");
    if (score <= 66) return t("tests.burnout.mildFatigue");
    if (score <= 88) return t("tests.burnout.noticeableBurnout");
    if (score <= 110) return t("tests.burnout.severeBurnout");
    return t("tests.burnout.extremeBurnout");
  };

  const getBurnoutLevelColor = (score: number) => {
    if (score <= 22) return { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800', icon: 'bg-green-200 text-green-700' };
    if (score <= 44) return { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800', icon: 'bg-blue-200 text-blue-700' };
    if (score <= 66) return { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'bg-yellow-200 text-yellow-700' };
    if (score <= 88) return { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800', icon: 'bg-orange-200 text-orange-700' };
    if (score <= 110) return { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-800', icon: 'bg-red-200 text-red-700' };
    return { bg: 'bg-red-200', border: 'border-red-300', text: 'text-red-900', icon: 'bg-red-300 text-red-800' };
  };

  const getDominantChannel = () => {
    if (!testResults.perception.scores) return null;
    const scores = testResults.perception.scores;
    const channels = [
      { name: 'Visual', key: 'visual', score: scores.V },
      { name: 'Auditory', key: 'auditory', score: scores.A },
      { name: 'Kinesthetic', key: 'kinesthetic', score: scores.K },
      { name: 'Digital', key: 'digital', score: scores.D }
    ];
    const dominant = channels.reduce((max, channel) => 
      channel.score > max.score ? channel : max
    );
    return dominant;
  };

  const getChannelIcon = (channelKey: string | null) => {
    const iconMap: Record<string, any> = {
      'visual': Eye,
      'auditory': Volume2,
      'kinesthetic': Hand,
      'digital': Monitor
    };
    return channelKey ? iconMap[channelKey] : Brain;
  };

  const getPreferenceArchetypes = () => {
    if (!testResults.preference.scores) return [];
    const scores = testResults.preference.scores;
    const archetypes = [];
    
    if (scores.soloGroup >= 5) archetypes.push(t("tests.preference.independentWorker"));
    else archetypes.push(t("tests.preference.teamPlayer"));
    
    if (scores.onlineOffline >= 5) archetypes.push(t("tests.preference.digitalNavigator"));
    else archetypes.push(t("tests.preference.inPersonEngager"));
    
    if (scores.stabilityFlexibility >= 5) archetypes.push(t("tests.preference.structureSeeker"));
    else archetypes.push(t("tests.preference.lifelongLearner"));
    
    if (scores.dynamicHarmony >= 5) archetypes.push(t("tests.preference.adaptiveGoGetter"));
    else archetypes.push(t("tests.preference.steadyCollaborator"));
    
    return archetypes;
  };

  const overallProgress = calculateProgress();

  if (loading) {
    return <div className="p-8">{t("meloria.loading")}</div>;
  }

  if (!member) {
    return <div className="p-8">{t("meloria.memberNotFound")}</div>;
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/meloria-admin/company-groups/${member.group_id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("meloria.back")}
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {member.name} {member.surname}{t("meloria.viewDashboardTitle")}
        </h1>
        <p className="text-muted-foreground">{member.email}</p>
        <Badge className="mt-2" variant="outline">
          {member.access_rights === "employee" ? t("meloria.employeeRole") : t("meloria.companyRole")}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card className="p-8 mb-8">
        {overallProgress >= 100 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold mb-4">{t("meloria.allTestsCompleted")}</h2>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">{t("meloria.testProgress")}</h2>
                <p className="text-muted-foreground">
                  {testResults.burnout.completed 
                    ? t("meloria.testsInProgress")
                    : t("meloria.noTestsYet")}
                </p>
              </div>
              <div className="text-4xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </>
        )}
      </Card>

      {/* Results Summary - Shown when 100% complete */}
      {overallProgress >= 100 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">{t("meloria.results")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Burnout Test Summary */}
            {testResults.burnout.completed && testResults.burnout.score !== null && (() => {
              const colors = getBurnoutLevelColor(testResults.burnout.score);
              return (
                <Card className={`p-6 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${colors.icon} flex items-center justify-center`}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <h3 className={`font-semibold ${colors.text}`}>{t("meloria.burnoutLevel")}</h3>
                  </div>
                  <p className={`font-medium ${colors.text}`}>{getBurnoutLevel(testResults.burnout.score)}</p>
                  <p className={`text-sm ${colors.text} opacity-75`}>{t("meloria.score")}: {testResults.burnout.score}/132</p>
                </Card>
              );
            })()}

            {/* Channel Perception Summary */}
            {testResults.perception.completed && (() => {
              const channel = getDominantChannel();
              const ChannelIcon = getChannelIcon(channel?.key || null);
              const channelName = channel ? t(`tests.perception.${channel.key}`) : '';
              return (
                <Card className="p-6 bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                      <ChannelIcon className="h-5 w-5 text-purple-700" />
                    </div>
                    <h3 className="font-semibold text-purple-900">{t("meloria.dominantStyle")}</h3>
                  </div>
                  <p className="font-medium text-purple-800">{channelName} {t("meloria.learner")}</p>
                </Card>
              );
            })()}

            {/* Preference Test Summary */}
            {testResults.preference.completed && (
              <Card className="p-6 bg-blue-100 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-blue-900">{t("meloria.archetypes")}</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getPreferenceArchetypes().map((archetype, idx) => (
                    <span key={idx} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      {archetype}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </Card>
      )}

      {/* Individual Test Status */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Burnout Test Card */}
        <Card className="p-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t("meloria.burnoutTest")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("meloria.maslachInventory")}
          </p>
          {testResults.burnout.completed ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>{t("meloria.completed")} - {t("meloria.score")}: {testResults.burnout.score}/132</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("meloria.notCompleted")}</span>
            </div>
          )}
        </Card>

        {/* Channel Perception Card */}
        <Card className="p-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t("meloria.channelPerceptionTest")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("meloria.vakdAssessment")}
          </p>
          {testResults.perception.completed ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>{t("meloria.completed")} - {getDominantChannel() ? t(`tests.perception.${getDominantChannel()?.key}`) : ''} {t("meloria.dominant")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("meloria.notCompleted")}</span>
            </div>
          )}
        </Card>

        {/* Preference Test Card */}
        <Card className="p-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardCheck className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t("meloria.workPreferencesTest")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("meloria.motivationPreferences")}
          </p>
          {testResults.preference.completed ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>{t("meloria.completed")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("meloria.notCompleted")}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViewDashboard;
