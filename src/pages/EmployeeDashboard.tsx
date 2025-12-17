import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Brain, 
  Heart, 
  Calendar,
  ArrowRight,
  Clock,
  Check,
  Eye,
  Volume2,
  Hand,
  Monitor,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Bell,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, addMonths, isBefore } from "date-fns";
import { TestDueNotification } from "@/components/TestDueNotification";

interface EventInvitation {
  id: string;
  event_id: string;
  viewed_at: string | null;
  created_at: string;
  event?: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    group?: {
      name: string;
    };
  };
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [testStatus, setTestStatus] = useState({
    burnout: { completed: false, lastTaken: null as string | null, score: null as number | null },
    perception: { completed: false, lastTaken: null as string | null },
    preference: { completed: false, lastTaken: null as string | null }
  });
  const [eventInvitations, setEventInvitations] = useState<EventInvitation[]>([]);
  
  // Calendar state - starting at December 1-7, 2025
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 11, 1)); // December 1, 2025

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setIsLoading(false);
      loadEventInvitations(user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadEventInvitations = async (userId: string) => {
    try {
      // Get user email from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (!profile?.email) return;

      // Get invitations for this user
      const { data: invitations, error } = await supabase
        .from("event_invitations" as any)
        .select("*")
        .eq("user_email", profile.email)
        .is("viewed_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch event details for each invitation
      const invitationsWithEvents = await Promise.all(
        (invitations as any[] || []).map(async (inv) => {
          const { data: event } = await supabase
            .from("events" as any)
            .select("id, name, description, created_at, group_id")
            .eq("id", inv.event_id)
            .single();

          let groupName = "";
          if (event) {
            const { data: group } = await supabase
              .from("company_groups" as any)
              .select("name")
              .eq("id", (event as any).group_id)
              .single();
            groupName = (group as any)?.name || "";
          }

          return {
            ...inv,
            event: event ? {
              ...(event as any),
              group: { name: groupName }
            } : null
          };
        })
      );

      setEventInvitations(invitationsWithEvents.filter(inv => inv.event));
    } catch (error) {
      console.error("Error loading event invitations:", error);
    }
  };

  const markInvitationAsViewed = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("event_invitations" as any)
        .update({ viewed_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (error) throw error;
      
      setEventInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast.success(t('common.success'));
    } catch (error) {
      console.error("Error marking invitation as viewed:", error);
    }
  };

  useEffect(() => {
    if (isLoading) return; // Don't load test status until auth is confirmed
    
    const loadTestStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - database is the source of truth
        const { data: testResults } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id);
        
        const burnoutData = testResults?.find(r => r.test_type === 'burnout');
        const perceptionData = testResults?.find(r => r.test_type === 'perception');
        const preferenceData = testResults?.find(r => r.test_type === 'preference');
        
        // Clear localStorage if database doesn't have the data (admin may have reset)
        if (!burnoutData) localStorage.removeItem('burnoutTest');
        if (!perceptionData) localStorage.removeItem('channelPerceptionTest');
        if (!preferenceData) localStorage.removeItem('preferenceTest');

        setTestStatus({
          burnout: {
            completed: !!burnoutData,
            lastTaken: burnoutData ? burnoutData.completed_at : null,
            score: burnoutData ? (burnoutData.scores as any).total : null
          },
          perception: {
            completed: !!perceptionData,
            lastTaken: perceptionData ? perceptionData.completed_at : null
          },
          preference: {
            completed: !!preferenceData,
            lastTaken: preferenceData ? preferenceData.completed_at : null
          }
        });
      } else {
        // No user - fallback to localStorage
        const localBurnout = localStorage.getItem('burnoutTest');
        const localPerception = localStorage.getItem('channelPerceptionTest');
        const localPreference = localStorage.getItem('preferenceTest');

        setTestStatus({
          burnout: {
            completed: !!localBurnout,
            lastTaken: localBurnout ? JSON.parse(localBurnout).completedAt : null,
            score: localBurnout ? JSON.parse(localBurnout).scores.total : null
          },
          perception: {
            completed: !!localPerception,
            lastTaken: localPerception ? JSON.parse(localPerception).completedAt : null
          },
          preference: {
            completed: !!localPreference,
            lastTaken: localPreference ? JSON.parse(localPreference).completedAt : null
          }
        });
      }
    };

    loadTestStatus();
  }, [isLoading]);

  // Calculate progress
  const calculateProgress = () => {
    let progress = 0;
    
    // If burnout test completed
    if (testStatus.burnout.completed) {
      // If score is <= 44, automatically set to 100%
      if (testStatus.burnout.score !== null && testStatus.burnout.score <= 44) {
        return 100;
      }
      
      // Otherwise, burnout contributes 40%
      progress += 40;
      
      // Other tests contribute 30% each if completed
      if (testStatus.perception.completed) progress += 30;
      if (testStatus.preference.completed) progress += 30;
    }
    
    return progress;
  };

  const overallProgress = calculateProgress();
  const otherTestsOptional = testStatus.burnout.completed && testStatus.burnout.score !== null && testStatus.burnout.score <= 44;

  const getBurnoutLevel = (score: number) => {
    if (score <= 22) return t('tests.burnout.perfectWellbeing');
    if (score <= 44) return t('tests.burnout.balancedResilient');
    if (score <= 66) return t('tests.burnout.mildFatigue');
    if (score <= 88) return t('tests.burnout.noticeableBurnout');
    if (score <= 110) return t('tests.burnout.severeBurnout');
    return t('tests.burnout.extremeBurnout');
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
    const perceptionData = localStorage.getItem('channelPerceptionTest');
    if (!perceptionData) return null;
    const data = JSON.parse(perceptionData);
    const scores = data.scores;
    const channels = [
      { name: t('tests.perception.visual'), score: scores.V },
      { name: t('tests.perception.auditory'), score: scores.A },
      { name: t('tests.perception.kinesthetic'), score: scores.K },
      { name: t('tests.perception.digital'), score: scores.D }
    ];
    const dominant = channels.reduce((max, channel) => 
      channel.score > max.score ? channel : max
    );
    return dominant.name;
  };

  const getChannelIcon = (channel: string | null) => {
    const visual = t('tests.perception.visual');
    const auditory = t('tests.perception.auditory');
    const kinesthetic = t('tests.perception.kinesthetic');
    const digital = t('tests.perception.digital');
    
    if (channel === visual) return Eye;
    if (channel === auditory) return Volume2;
    if (channel === kinesthetic) return Hand;
    if (channel === digital) return Monitor;
    return Brain;
  };

  const getPreferenceArchetypes = () => {
    const preferenceData = localStorage.getItem('preferenceTest');
    if (!preferenceData) return [];
    const data = JSON.parse(preferenceData);
    const scores = data.scores;
    const archetypes = [];
    
    if (scores.soloGroup >= 5) archetypes.push(t('tests.preference.independentWorker'));
    else archetypes.push(t('tests.preference.teamPlayer'));
    
    if (scores.onlineOffline >= 5) archetypes.push(t('tests.preference.digitalNavigator'));
    else archetypes.push(t('tests.preference.inPersonEngager'));
    
    if (scores.stabilityFlexibility >= 5) archetypes.push(t('tests.preference.structureSeeker'));
    else archetypes.push(t('tests.preference.lifelongLearner'));
    
    if (scores.dynamicHarmony >= 5) archetypes.push(t('tests.preference.adaptiveGoGetter'));
    else archetypes.push(t('tests.preference.steadyCollaborator'));
    
    return archetypes;
  };

  // Calendar navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Get activity for a specific date
  const getActivityForDate = (date: Date) => {
    const activities: Record<string, string> = {
      '2025-12-02': t('employee.activities.walk'),
      '2025-12-05': t('employee.activities.meditate')
    };
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return activities[dateStr] || null;
  };

  const formatMonthYear = () => {
    const monthNames = [
      t('employee.months.january'), t('employee.months.february'),
      t('employee.months.march'), t('employee.months.april'),
      t('employee.months.may'), t('employee.months.june'),
      t('employee.months.july'), t('employee.months.august'),
      t('employee.months.september'), t('employee.months.october'),
      t('employee.months.november'), t('employee.months.december')
    ];
    return `${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`;
  };

  const getDayName = (date: Date) => {
    const dayNames = [
      t('employee.days.sun'), t('employee.days.mon'),
      t('employee.days.tue'), t('employee.days.wed'),
      t('employee.days.thu'), t('employee.days.fri'),
      t('employee.days.sat')
    ];
    return dayNames[date.getDay()];
  };

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />

      <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('employee.welcomeTitle')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('employee.welcomeSubtitle')}
          </p>
        </div>

        {/* Test Due Notifications */}
        <TestDueNotification
          tests={[
            { completed: testStatus.burnout.completed, lastTaken: testStatus.burnout.lastTaken, name: t('employee.burnoutTest') },
            { completed: testStatus.perception.completed, lastTaken: testStatus.perception.lastTaken, name: t('employee.channelPerceptionTest') },
            { completed: testStatus.preference.completed, lastTaken: testStatus.preference.lastTaken, name: t('employee.preferencesTest') },
          ]}
        />

        {/* Overall Progress */}
        <Card className="p-8 mb-8 animate-slide-up">
          {overallProgress >= 100 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold mb-4">{t('employee.youreAllSet')}</h2>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">{t('employee.yourProgress')}</h2>
                  <p className="text-muted-foreground">
                    {otherTestsOptional 
                      ? t('employee.otherTestsOptional')
                      : testStatus.burnout.completed && testStatus.burnout.score !== null && testStatus.burnout.score > 44
                      ? t('employee.completeAllAssessments')
                      : t('employee.completeBurnoutFirst')}
                  </p>
                </div>
                <div className="text-4xl font-bold text-primary">{overallProgress}%</div>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </>
          )}
        </Card>

        {/* Summary Cards - Shown when 100% complete */}
        {overallProgress >= 100 && (
          <Card className="p-6 mb-8 animate-slide-up">
            <h2 className="text-xl font-semibold mb-6 text-center">{t('employee.results')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Burnout Test Summary */}
              {testStatus.burnout.completed && testStatus.burnout.score !== null && (() => {
                const colors = getBurnoutLevelColor(testStatus.burnout.score);
                return (
                  <Card className={`p-6 ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${colors.icon} flex items-center justify-center`}>
                        <Heart className="h-5 w-5" />
                      </div>
                      <h3 className={`font-semibold ${colors.text}`}>{t('employee.burnoutLevel')}</h3>
                    </div>
                    <p className={`font-medium ${colors.text}`}>{getBurnoutLevel(testStatus.burnout.score)}</p>
                  </Card>
                );
              })()}

              {/* Channel Perception Summary */}
              {testStatus.perception.completed && (() => {
                const channel = getDominantChannel();
                const ChannelIcon = getChannelIcon(channel);
                return (
                  <Card className="p-6 bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <ChannelIcon className="h-5 w-5 text-purple-700" />
                      </div>
                      <h3 className="font-semibold text-purple-900">{t('employee.dominantStyle')}</h3>
                    </div>
                    <p className="font-medium text-purple-800">{channel} {t('employee.learner')}</p>
                  </Card>
                );
              })()}

              {/* Preference Test Summary */}
              {testStatus.preference.completed && (
                <Card className="p-6 bg-blue-100 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-700" />
                    </div>
                    <h3 className="font-semibold text-blue-900">{t('employee.yourArchetypes')}</h3>
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

        {/* Event Invitations */}
        {eventInvitations.length > 0 && (
          <Card className="p-6 mb-8 animate-slide-up border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('employee.eventInvitations')}</h2>
              <Badge variant="secondary">{eventInvitations.length}</Badge>
            </div>
            <div className="space-y-3">
              {eventInvitations.map((invitation) => (
                <div key={invitation.id} className="flex justify-between items-start p-4 bg-background rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                      <p className="font-medium">{invitation.event?.name}</p>
                    </div>
                    {invitation.event?.description && (
                      <p className="text-sm text-muted-foreground mb-1">{invitation.event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('employee.from')}: {invitation.event?.group?.name} • {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markInvitationAsViewed(invitation.id)}
                  >
                    {t('employee.dismiss')}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Assessment Tests */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Burnout Test Card */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('employee.burnoutTest')}</h3>
                <p className="text-sm text-muted-foreground">{t('employee.burnoutTestDescription')}</p>
              </div>
            </div>
            
            {testStatus.burnout.completed ? (
              <div className="space-y-3">
                <Badge variant="secondary" className="w-full justify-center py-1">
                  <Check className="h-3 w-3 mr-1" />
                  {t('employee.completed')}
                </Badge>
                {testStatus.burnout.lastTaken && (
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('employee.completedOn')} {format(new Date(testStatus.burnout.lastTaken), 'PPP')}
                    </p>
                    {(() => {
                      const nextDue = addMonths(new Date(testStatus.burnout.lastTaken), 1);
                      const isOverdue = isBefore(nextDue, new Date());
                      return isOverdue ? (
                        <p className="text-xs text-destructive flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('employee.testOverdue')}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          {t('employee.nextTestDue')}: {format(nextDue, 'PPP')}
                        </p>
                      );
                    })()}
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/test/burnout")}>
                  {t('employee.viewResults')}
                </Button>
              </div>
            ) : (
              <Button className="w-full" onClick={() => navigate("/test/burnout")}>
                {t('employee.takeTest')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </Card>

          {/* Channel Perception Test Card */}
          <Card className={`p-6 animate-slide-up ${!testStatus.burnout.completed ? 'opacity-60' : ''}`} style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('employee.channelPerceptionTest')}</h3>
                <p className="text-sm text-muted-foreground">{t('employee.channelPerceptionTestDescription')}</p>
              </div>
            </div>
            
            {testStatus.perception.completed ? (
              <div className="space-y-3">
                <Badge variant="secondary" className="w-full justify-center py-1">
                  <Check className="h-3 w-3 mr-1" />
                  {t('employee.completed')}
                </Badge>
                {testStatus.perception.lastTaken && (
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('employee.completedOn')} {format(new Date(testStatus.perception.lastTaken), 'PPP')}
                    </p>
                    {(() => {
                      const nextDue = addMonths(new Date(testStatus.perception.lastTaken), 1);
                      const isOverdue = isBefore(nextDue, new Date());
                      return isOverdue ? (
                        <p className="text-xs text-destructive flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('employee.testOverdue')}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          {t('employee.nextTestDue')}: {format(nextDue, 'PPP')}
                        </p>
                      );
                    })()}
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/test/perception")}>
                  {t('employee.viewResults')}
                </Button>
              </div>
            ) : !testStatus.burnout.completed ? (
              <div className="space-y-3">
                <Badge variant="outline" className="w-full justify-center py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('employee.locked')}
                </Badge>
                <p className="text-xs text-muted-foreground text-center">
                  {t('employee.completeBurnoutToUnlock')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {otherTestsOptional && (
                  <Badge variant="outline" className="w-full justify-center py-1 text-green-600 border-green-300">
                    {t('employee.optional')}
                  </Badge>
                )}
                <Button className="w-full" onClick={() => navigate("/test/perception")}>
                  {t('employee.takeTest')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>

          {/* Preference Test Card */}
          <Card className={`p-6 animate-slide-up ${!testStatus.burnout.completed ? 'opacity-60' : ''}`} style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('employee.preferencesTest')}</h3>
                <p className="text-sm text-muted-foreground">{t('employee.preferencesTestDescription')}</p>
              </div>
            </div>
            
            {testStatus.preference.completed ? (
              <div className="space-y-3">
                <Badge variant="secondary" className="w-full justify-center py-1">
                  <Check className="h-3 w-3 mr-1" />
                  {t('employee.completed')}
                </Badge>
                {testStatus.preference.lastTaken && (
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('employee.completedOn')} {format(new Date(testStatus.preference.lastTaken), 'PPP')}
                    </p>
                    {(() => {
                      const nextDue = addMonths(new Date(testStatus.preference.lastTaken), 1);
                      const isOverdue = isBefore(nextDue, new Date());
                      return isOverdue ? (
                        <p className="text-xs text-destructive flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('employee.testOverdue')}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          {t('employee.nextTestDue')}: {format(nextDue, 'PPP')}
                        </p>
                      );
                    })()}
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/test/preference")}>
                  {t('employee.viewResults')}
                </Button>
              </div>
            ) : !testStatus.burnout.completed ? (
              <div className="space-y-3">
                <Badge variant="outline" className="w-full justify-center py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('employee.locked')}
                </Badge>
                <p className="text-xs text-muted-foreground text-center">
                  {t('employee.completeBurnoutToUnlock')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {otherTestsOptional && (
                  <Badge variant="outline" className="w-full justify-center py-1 text-green-600 border-green-300">
                    {t('employee.optional')}
                  </Badge>
                )}
                <Button className="w-full" onClick={() => navigate("/test/preference")}>
                  {t('employee.takeTest')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Weekly Activity Calendar */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('employee.suggestedWeeklyActivities')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center">{formatMonthYear()}</span>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((date, index) => {
              const activity = getActivityForDate(date);
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border min-h-[100px] ${
                    activity ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold">{date.getDate()}</div>
                    <div className="text-xs text-muted-foreground">{getDayName(date)}</div>
                  </div>
                  {activity && (
                    <p className="text-xs text-center text-primary font-medium">{activity}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
