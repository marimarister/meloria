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
  Menu,
  User,
  ChevronLeft,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [testStatus, setTestStatus] = useState({
    burnout: { completed: false, lastTaken: null as string | null, score: null as number | null },
    perception: { completed: false, lastTaken: null as string | null },
    preference: { completed: false, lastTaken: null as string | null }
  });

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

  return (
    <div className="min-h-screen gradient-employee">
      {/* Navigation Bar */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
            >
              Meloria
            </button>
            
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

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
            {overallProgress >= 100 ? (
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
              </div>
            ) : (
              <div className="text-4xl font-bold text-primary">{overallProgress}%</div>
            )}
          </div>
          {overallProgress < 100 && <Progress value={overallProgress} className="h-3" />}
          
          {overallProgress >= 100 && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetAll}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Reset All Results
              </Button>
            </div>
          )}
        </Card>

        {/* Summary Cards - Shown when 100% complete */}
        {overallProgress >= 100 && (
          <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-up">
            {/* Burnout Test Summary */}
            {testStatus.burnout.completed && testStatus.burnout.score !== null && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Burnout Test</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Your Status:</p>
                <p className="font-medium text-primary">{getBurnoutLevel(testStatus.burnout.score)}</p>
                <p className="text-xs text-muted-foreground mt-2">Score: {testStatus.burnout.score}/132</p>
              </Card>
            )}

            {/* Channel Perception Summary */}
            {testStatus.perception.completed && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Channel Perception</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Dominant Style:</p>
                <p className="font-medium text-primary">{getDominantChannel()} Learner</p>
              </Card>
            )}

            {/* Preference Test Summary */}
            {testStatus.preference.completed && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Work Preferences</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Your Archetypes:</p>
                <div className="flex flex-wrap gap-1">
                  {getPreferenceArchetypes().map((archetype, idx) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {archetype}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Test Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Burnout Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Burnout Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
              className="w-full"
              onClick={() => navigate('/test/burnout')}
            >
              {testStatus.burnout.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Channel Perception Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Channel Perception Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
              className="w-full"
              onClick={() => navigate('/test/perception')}
              disabled={!testStatus.burnout.completed}
            >
              {testStatus.perception.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Preference Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Work Preferences & Motivation Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
              className="w-full"
              onClick={() => navigate('/test/preference')}
              disabled={!testStatus.burnout.completed}
            >
              {testStatus.preference.completed ? 'View Results' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Results Section - Shown only when tests are completed */}
        {overallProgress >= 100 && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Your Wellness Score
              </h2>
              <p className="text-muted-foreground mb-6">
                Based on your completed assessments
              </p>
              {/* Score visualization will go here */}
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Weekly Activities
              </h2>
              <p className="text-muted-foreground mb-6">
                Personalized wellness plan for this week
              </p>
              {/* Activity calendar will go here */}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
