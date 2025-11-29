import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  Brain, 
  Heart, 
  Calendar,
  ArrowRight,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real data from backend
  const testStatus = {
    burnout: { completed: false, lastTaken: null, score: null },
    perception: { completed: false, lastTaken: null, score: null },
    preference: { completed: false, lastTaken: null, score: null }
  };

  const overallProgress = 0; // Will be calculated based on completed tests

  return (
    <div className="min-h-screen gradient-employee">
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
              <p className="text-muted-foreground">Complete all assessments to unlock personalized insights</p>
            </div>
            <div className="text-4xl font-bold text-primary">{overallProgress}%</div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </Card>

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
                <span>Last taken: {testStatus.burnout.lastTaken}</span>
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
              {testStatus.burnout.completed ? 'Retake Test' : 'Start Test'}
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
                <span>Last taken: {testStatus.perception.lastTaken}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <ClipboardCheck className="h-4 w-4" />
                <span>Not completed yet</span>
              </div>
            )}
            
            <Button 
              className="w-full"
              onClick={() => navigate('/test/perception')}
            >
              {testStatus.perception.completed ? 'Retake Test' : 'Start Test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Preference Test */}
          <Card className="p-6 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Preference Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Wellness Preferences - Tell us about your wellbeing goals and lifestyle
            </p>
            
            {testStatus.preference.lastTaken ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Last taken: {testStatus.preference.lastTaken}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <ClipboardCheck className="h-4 w-4" />
                <span>Not completed yet</span>
              </div>
            )}
            
            <Button 
              className="w-full"
              onClick={() => navigate('/test/preference')}
            >
              {testStatus.preference.completed ? 'Retake Test' : 'Start Test'}
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
