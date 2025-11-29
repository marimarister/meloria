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
  Trash2
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                {overallProgress >= 100 ? "You're all set" : "Your Progress"}
              </h2>
              {overallProgress < 100 && (
                <p className="text-muted-foreground">
                  {otherTestsOptional 
                    ? "Great news! Based on your burnout score, the other tests are optional."
                    : testStatus.burnout.completed && testStatus.burnout.score !== null && testStatus.burnout.score > 44
                    ? "Complete all assessments to unlock personalized insights"
                    : "Complete the Burnout Test to get started"}
                </p>
              )}
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
        </Card>

        {/* Summary Cards - Shown when 100% complete */}
        {overallProgress >= 100 && (
          <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-up">
            {/* Burnout Test Summary */}
            {testStatus.burnout.completed && testStatus.burnout.score !== null && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Burnout Level</h3>
                </div>
                <p className="font-medium text-blue-800">{getBurnoutLevel(testStatus.burnout.score)}</p>
                <p className="text-xs text-blue-600 mt-2">Score: {testStatus.burnout.score}/132</p>
              </Card>
            )}

            {/* Channel Perception Summary */}
            {testStatus.perception.completed && (
              <Card className="p-6 bg-purple-50 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-700" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Dominant Style</h3>
                </div>
                <p className="font-medium text-purple-800">{getDominantChannel()} Learner</p>
              </Card>
            )}

            {/* Preference Test Summary */}
            {testStatus.preference.completed && (
              <Card className="p-6 bg-amber-50 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-amber-900">Your Archetypes</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getPreferenceArchetypes().map((archetype, idx) => (
                    <span key={idx} className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
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
