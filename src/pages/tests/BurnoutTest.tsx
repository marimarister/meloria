import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, CheckCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

const SCALE_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "A few times a year or less" },
  { value: 2, label: "Once a month or less" },
  { value: 3, label: "A few times a month" },
  { value: 4, label: "Once a week" },
  { value: 5, label: "A few times a week" },
  { value: 6, label: "Every day" },
];

// Reversed scale for Personal Accomplishment questions
const SCALE_OPTIONS_PA = [
  { value: 6, label: "Never" },
  { value: 5, label: "A few times a year or less" },
  { value: 4, label: "Once a month or less" },
  { value: 3, label: "A few times a month" },
  { value: 2, label: "Once a week" },
  { value: 1, label: "A few times a week" },
  { value: 0, label: "Every day" },
];

const QUESTIONS = [
  // Emotional Exhaustion (1-9)
  { id: 1, text: "I feel emotionally drained from my work.", section: "EE" },
  { id: 2, text: "I feel used up at the end of the workday.", section: "EE" },
  { id: 3, text: "I feel fatigued when I get up in the morning and have to face another day on the job.", section: "EE" },
  { id: 4, text: "Working with people all day is really a strain for me.", section: "EE" },
  { id: 5, text: "I feel burned out from my work.", section: "EE" },
  { id: 6, text: "I feel frustrated by my job.", section: "EE" },
  { id: 7, text: "I feel I'm working too hard on my job.", section: "EE" },
  { id: 8, text: "Working with people directly puts too much stress on me.", section: "EE" },
  { id: 9, text: "I feel like I'm at the end of my rope.", section: "EE" },
  
  // Depersonalization (10-14)
  { id: 10, text: "I feel I treat some recipients as if they were impersonal objects.", section: "DP" },
  { id: 11, text: "I've become more callous toward people since I took this job.", section: "DP" },
  { id: 12, text: "I worry that this job is hardening me emotionally.", section: "DP" },
  { id: 13, text: "I don't really care what happens to some recipients.", section: "DP" },
  { id: 14, text: "I feel recipients blame me for some of their problems.", section: "DP" },
  
  // Personal Accomplishment (15-22)
  { id: 15, text: "I can easily understand how my recipients feel about things.", section: "PA" },
  { id: 16, text: "I deal very effectively with the problems of my recipients.", section: "PA" },
  { id: 17, text: "I feel I'm positively influencing other people's lives through my work.", section: "PA" },
  { id: 18, text: "I feel very energetic.", section: "PA" },
  { id: 19, text: "I can easily create a relaxed atmosphere with my recipients.", section: "PA" },
  { id: 20, text: "I feel exhilarated after working closely with my recipients.", section: "PA" },
  { id: 21, text: "I have accomplished many worthwhile things in this job.", section: "PA" },
  { id: 22, text: "In my work, I deal with emotional problems very calmly.", section: "PA" },
];

const BURNOUT_LEVELS = [
  { min: 0, max: 22, title: "Perfect Wellbeing", description: "You are in excellent condition! Your energy, resilience, and sense of accomplishment are strong. Keep nurturing your wellbeing and enjoy your work-life balance.", color: "text-green-600" },
  { min: 23, max: 44, title: "Balanced & Resilient", description: "You are doing well overall, with only occasional signs of stress. Maintain your healthy habits and stay mindful of your needs to keep thriving.", color: "text-blue-600" },
  { min: 45, max: 66, title: "Mild Fatigue", description: "Some early signs of tiredness or stress are present. This is a good moment to pause, recharge, and introduce restorative practices into your routine.", color: "text-yellow-600" },
  { min: 67, max: 88, title: "Noticeable Burnout Symptoms", description: "You are experiencing clear symptoms of burnout. It's time to prioritize self-care, set boundaries, and seek support from colleagues or wellbeing professionals.", color: "text-orange-600" },
  { min: 89, max: 110, title: "Severe Burnout", description: "Burnout is seriously impacting your wellbeing and performance. Immediate action is needed: consider taking a break, reaching out for help, and making significant changes to your work routine.", color: "text-red-600" },
  { min: 111, max: 132, title: "Extreme Burnout Risk", description: "You are at a critical level of exhaustion. Your health and wellbeing are at serious risk. Please seek urgent support and consider professional help—your recovery is the top priority now.", color: "text-red-800" },
];

const BurnoutTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [savedResults, setSavedResults] = useState<any>(null);

  useEffect(() => {
    const checkExistingResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - database is the source of truth
        const { data } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .eq("test_type", "burnout")
          .single();
        
        if (data) {
          setSavedResults({
            scores: data.scores,
            completedAt: data.completed_at,
            completed: true
          });
          setShowResults(true);
        } else {
          // Database doesn't have this test - clear localStorage (admin may have reset)
          localStorage.removeItem('burnoutTest');
        }
        return;
      }
      
      // No user - fallback to localStorage
      const stored = localStorage.getItem('burnoutTest');
      if (stored) {
        const localData = JSON.parse(stored);
        setSavedResults(localData);
        setShowResults(true);
      }
    };
    
    checkExistingResults();
  }, []);

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  const handleSubmit = async () => {
    const scores = calculateScores();
    const completedAt = new Date().toISOString();
    const results = {
      scores,
      completedAt,
      completed: true
    };
    
    // Save to localStorage for backward compatibility
    localStorage.setItem('burnoutTest', JSON.stringify(results));
    
    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("test_results").upsert({
        user_id: user.id,
        test_type: "burnout",
        scores: scores,
        completed_at: completedAt
      }, { onConflict: 'user_id,test_type' });
    }
    
    setSavedResults(results);
    setShowResults(true);
  };

  const calculateScores = () => {
    const emotionalExhaustion = QUESTIONS.filter(q => q.section === "EE").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const depersonalization = QUESTIONS.filter(q => q.section === "DP").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const personalAccomplishment = QUESTIONS.filter(q => q.section === "PA").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const total = emotionalExhaustion + depersonalization + personalAccomplishment;
    
    return { emotionalExhaustion, depersonalization, personalAccomplishment, total };
  };

  const getBurnoutLevel = (score: number) => {
    return BURNOUT_LEVELS.find(level => score >= level.min && score <= level.max) || BURNOUT_LEVELS[0];
  };

  if (showResults) {
    const scores = savedResults ? savedResults.scores : calculateScores();
    const level = getBurnoutLevel(scores.total);
    
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        
        <div className="px-6 py-8 mx-auto max-w-4xl">
          <Card className="p-8 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">Test Complete!</h1>
            <p className="text-center text-muted-foreground mb-8">Here are your results</p>

            {/* Overall Score with Level and Gradient Bar */}
            <Card className="p-6 mb-8">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Overall Burnout Score</p>
                <p className="text-5xl font-bold text-primary mb-1">{scores.total}</p>
                <p className="text-sm text-muted-foreground">out of 132</p>
              </div>
              
              {/* Burnout Level */}
              <div className={`p-4 rounded-lg border-2 ${level.color} bg-background mb-6`}>
                <h2 className={`text-xl font-bold mb-2 ${level.color}`}>{level.title}</h2>
                <p className="text-sm text-foreground">{level.description}</p>
              </div>

              {/* Gradient Bar */}
              <div className="relative pt-8 pb-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                  {/* Vertical line indicator on the bar */}
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-foreground"
                    style={{ left: `${(scores.total / 132) * 100}%` }}
                  >
                    <div className="absolute -top-5 md:-top-8 left-1/2 -translate-x-1/2 text-sm md:text-lg font-bold whitespace-nowrap">
                      {Math.round((scores.total / 132) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </Card>

            {/* Detailed Scores */}
            <div className="space-y-4 mb-8">
              {/* Emotional Exhaustion */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  {/* Title and Score */}
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">Emotional Exhaustion</h3>
                    <div className="text-sm text-muted-foreground">{scores.emotionalExhaustion} out of 54</div>
                  </div>
                  
                  {/* Gradient Bar */}
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                      {/* Vertical line indicator on the bar */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-foreground"
                        style={{ left: `${(scores.emotionalExhaustion / 54) * 100}%` }}
                      >
                        <div className="absolute -top-5 md:-top-8 left-1/2 -translate-x-1/2 text-sm md:text-lg font-bold whitespace-nowrap">
                          {Math.round((scores.emotionalExhaustion / 54) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Depersonalization */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  {/* Title and Score */}
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">Depersonalization</h3>
                    <div className="text-sm text-muted-foreground">{scores.depersonalization} out of 30</div>
                  </div>
                  
                  {/* Gradient Bar */}
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                      {/* Vertical line indicator on the bar */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-foreground"
                        style={{ left: `${(scores.depersonalization / 30) * 100}%` }}
                      >
                        <div className="absolute -top-5 md:-top-8 left-1/2 -translate-x-1/2 text-sm md:text-lg font-bold whitespace-nowrap">
                          {Math.round((scores.depersonalization / 30) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Accomplishment */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  {/* Title and Score */}
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">Personal Accomplishment</h3>
                    <div className="text-sm text-muted-foreground">{scores.personalAccomplishment} out of 48</div>
                  </div>
                  
                  {/* Gradient Bar */}
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                      {/* Vertical line indicator on the bar */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-foreground"
                        style={{ left: `${(scores.personalAccomplishment / 48) * 100}%` }}
                      >
                        <div className="absolute -top-5 md:-top-8 left-1/2 -translate-x-1/2 text-sm md:text-lg font-bold whitespace-nowrap">
                          {Math.round((scores.personalAccomplishment / 48) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {savedResults && (
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Completed: {new Date(savedResults.completedAt).toLocaleDateString()} at {new Date(savedResults.completedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            <Button onClick={() => navigate("/employee")} className="w-full" size="lg">
              View Your Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />
      
      <div className="px-6 py-8 mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Progress: {Object.keys(answers).length} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">Please rate each statement</h2>

          <div className="space-y-4">
            {QUESTIONS.map((question, index) => (
              <div key={question.id} className="p-6 rounded-lg bg-green-50">
                <p className="font-medium mb-4">
                  {index + 1}. {question.text}
                </p>
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: parseInt(value) }))}
                >
                  <div className="space-y-2">
                    {(question.section === "PA" ? SCALE_OPTIONS_PA : SCALE_OPTIONS).map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`q${question.id}-${option.value}`}
                        />
                        <Label
                          htmlFor={`q${question.id}-${option.value}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== QUESTIONS.length}
            className="w-full mt-8"
            size="lg"
          >
            View Results
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default BurnoutTest;
