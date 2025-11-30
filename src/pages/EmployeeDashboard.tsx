import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  Brain, 
  Heart, 
  Calendar,
  ArrowRight,
  Clock,
  Check,
  Trash2,
  Eye,
  Volume2,
  Hand,
  Monitor,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [testStatus, setTestStatus] = useState({
    burnout: { completed: false, lastTaken: null as string | null, score: null as number | null },
    perception: { completed: false, lastTaken: null as string | null },
    preference: { completed: false, lastTaken: null as string | null }
  });
  
  // Calendar state - starting at December 1-7, 2025
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 11, 1)); // December 1, 2025

  useEffect(() => {
    // Load test status from localStorage
    const burnoutData = localStorage.getItem('burnoutTest');
    const perceptionData = localStorage.getItem('channelPerceptionTest');
    const preferenceData = localStorage.getItem('preferenceTest');

    setTestStatus({
      burnout: {
        completed: !!burnoutData,
        lastTaken: burnoutData ? JSON.parse(burnoutData).completedAt : null,
        score: burnoutData ? JSON.parse(burnoutData).scores.total : null
      },
      perception: {
        completed: !!perceptionData,
        lastTaken: perceptionData ? JSON.parse(perceptionData).completedAt : null
      },
      preference: {
        completed: !!preferenceData,
        lastTaken: preferenceData ? JSON.parse(preferenceData).completedAt : null
      }
    });
  }, []);

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
    if (score <= 22) return "Perfect Wellbeing";
    if (score <= 44) return "Balanced & Resilient";
    if (score <= 66) return "Mild Fatigue";
    if (score <= 88) return "Noticeable Burnout Symptoms";
    if (score <= 110) return "Severe Burnout";
    return "Extreme Burnout Risk";
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
      { name: 'Visual', score: scores.V },
      { name: 'Auditory', score: scores.A },
      { name: 'Kinesthetic', score: scores.K },
      { name: 'Digital', score: scores.D }
    ];
    const dominant = channels.reduce((max, channel) => 
      channel.score > max.score ? channel : max
    );
    return dominant.name;
  };

  const getChannelIcon = (channel: string | null) => {
    const iconMap: Record<string, any> = {
      'Visual': Eye,
      'Auditory': Volume2,
      'Kinesthetic': Hand,
      'Digital': Monitor
    };
    return channel ? iconMap[channel] : Brain;
  };

  const getPreferenceArchetypes = () => {
    const preferenceData = localStorage.getItem('preferenceTest');
    if (!preferenceData) return [];
    const data = JSON.parse(preferenceData);
    const scores = data.scores;
    const archetypes = [];
    
    if (scores.soloGroup >= 5) archetypes.push("Independent Worker");
    else archetypes.push("Team Player");
    
    if (scores.onlineOffline >= 5) archetypes.push("Digital Navigator");
    else archetypes.push("In-Person Engager");
    
    if (scores.stabilityFlexibility >= 5) archetypes.push("Structure & Stability Seeker");
    else archetypes.push("Lifelong Learner");
    
    if (scores.dynamicHarmony >= 5) archetypes.push("Adaptive Go-Getter");
    else archetypes.push("Steady Collaborator");
    
    return archetypes;
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all test results? This action cannot be undone.")) {
      localStorage.removeItem('burnoutTest');
      localStorage.removeItem('channelPerceptionTest');
      localStorage.removeItem('preferenceTest');
      setTestStatus({
        burnout: { completed: false, lastTaken: null, score: null },
        perception: { completed: false, lastTaken: null },
        preference: { completed: false, lastTaken: null }
      });
      toast.success("All test results have been reset");
    }
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
      '2025-12-02': 'Go on a walk for an hour',
      '2025-12-05': 'Meditate'
    };
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return activities[dateStr] || null;
  };

  const formatMonthYear = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`;
  };

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />

      <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to Your Wellness Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your wellbeing journey and discover personalized insights
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="p-8 mb-8 animate-slide-up">
          {overallProgress >= 100 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold mb-4">You're All Set</h2>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Your Progress</h2>
                  <p className="text-muted-foreground">
                    {otherTestsOptional 
                      ? "Great news! Based on your burnout score, the other tests are optional."
                      : testStatus.burnout.completed && testStatus.burnout.score !== null && testStatus.burnout.score > 44
                      ? "Complete all assessments to unlock personalized insights"
                      : "Complete the Burnout Test to get started"}
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
            <h2 className="text-xl font-semibold mb-6 text-center">Results</h2>
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
                      <h3 className={`font-semibold ${colors.text}`}>Burnout Level</h3>
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
                      <h3 className="font-semibold text-purple-900">Dominant Style</h3>
                    </div>
                    <p className="font-medium text-purple-800">{channel} Learner</p>
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
                    <h3 className="font-semibold text-blue-900">Your Archetypes</h3>
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

        {/* Test Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Burnout Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up flex flex-col h-full" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Burnout Test</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Maslach Burnout Inventory - Assess your emotional exhaustion and workplace stress
            </p>
            
            {testStatus.burnout.lastTaken ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Completed: {new Date(testStatus.burnout.lastTaken).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <ClipboardCheck className="h-4 w-4" />
                <span>Not completed yet</span>
              </div>
            )}
            
            <Button 
              className="w-full mt-auto"
              onClick={() => navigate('/test/burnout')}
            >
              {testStatus.burnout.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Channel Perception Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up flex flex-col h-full" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Channel Perception Test</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              VAK+D Assessment - Discover your optimal learning and communication style
            </p>
            
            {testStatus.perception.lastTaken ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Completed: {new Date(testStatus.perception.lastTaken).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <ClipboardCheck className="h-4 w-4" />
                <span>{otherTestsOptional ? 'Optional' : testStatus.burnout.completed ? 'Not completed yet' : 'Complete Burnout Test first'}</span>
              </div>
            )}
            
            <Button 
              className="w-full mt-auto"
              onClick={() => navigate('/test/perception')}
              disabled={!testStatus.burnout.completed}
            >
              {testStatus.perception.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Preference Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up flex flex-col h-full" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Work Preferences & Motivation Test</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              Wellness Preferences - Tell us about your wellbeing goals and lifestyle
            </p>
            
            {testStatus.preference.lastTaken ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Completed: {new Date(testStatus.preference.lastTaken).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <ClipboardCheck className="h-4 w-4" />
                <span>{otherTestsOptional ? 'Optional' : testStatus.burnout.completed ? 'Not completed yet' : 'Complete Burnout Test first'}</span>
              </div>
            )}
            
            <Button 
              className="w-full mt-auto"
              onClick={() => navigate('/test/preference')}
              disabled={!testStatus.burnout.completed}
            >
              {testStatus.preference.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Weekly Activities Section - Shown only when tests are completed */}
        {overallProgress >= 100 && (
          <Card className="p-4 md:p-8 mb-8">
            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
              {/* Title with Icon - Single Line */}
              <div className="flex items-center gap-2">
                <Calendar className="h-7 w-7 text-primary flex-shrink-0" />
                <h2 className="text-base font-semibold">Suggested Weekly Activities</h2>
              </div>
              
              {/* Navigation with Month/Year */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek('prev')}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {formatMonthYear()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek('next')}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getWeekDays().map((date, index) => {
                  const activity = getActivityForDate(date);
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border ${
                        activity 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-border'
                      } min-h-[100px] flex flex-col items-center justify-start`}
                    >
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {dayNames[date.getDay()]}
                        </div>
                        <div className="text-base font-semibold mb-1">
                          {date.getDate()}
                        </div>
                      </div>
                      {activity && (
                        <div className="text-[9px] text-foreground text-center leading-tight mt-1">
                          {activity}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Suggested Weekly Activities</h2>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateWeek('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[150px] text-center">
                    {formatMonthYear()}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateWeek('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((date, index) => {
                  const activity = getActivityForDate(date);
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        activity 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-muted/20 border-border'
                      } min-h-[120px]`}
                    >
                      <div className="text-center mb-2">
                        <div className="text-xs text-muted-foreground font-medium">
                          {dayNames[date.getDay()]}
                        </div>
                        <div className="text-lg font-semibold">
                          {date.getDate()}
                        </div>
                      </div>
                      {activity && (
                        <div className="text-xs text-foreground mt-2 text-center">
                          {activity}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
        {/* Reset Button at Bottom */}
        <div className="mt-8 flex justify-center pb-8">
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="w-full max-w-md"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
