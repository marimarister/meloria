import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import NavBar from "@/components/NavBar";

const SCALE_OPTIONS = [
  { value: "0", label: "Never" },
  { value: "1", label: "A few times a year or less" },
  { value: "2", label: "Once a month or less" },
  { value: "3", label: "A few times a month" },
  { value: "4", label: "Once a week" },
  { value: "5", label: "A few times a week" },
  { value: "6", label: "Every day" },
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [savedResults, setSavedResults] = useState<any>(null);

  useEffect(() => {
    // Check if test already completed
    const stored = localStorage.getItem('burnoutTest');
    if (stored) {
      const data = JSON.parse(stored);
      setSavedResults(data);
      setShowResults(true);
    }
  }, []);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const isAnswered = answers[QUESTIONS[currentQuestion].id] !== undefined;
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: parseInt(value) });
  };

  const handleNext = () => {
    if (isLastQuestion && isAnswered) {
      const { ee, dp, pa, total } = calculateScores();
      const results = {
        scores: { ee, dp, pa, total },
        completedAt: new Date().toISOString(),
        completed: true
      };
      localStorage.setItem('burnoutTest', JSON.stringify(results));
      setSavedResults(results);
      setShowResults(true);
    } else if (isAnswered) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScores = () => {
    const ee = QUESTIONS.filter(q => q.section === "EE").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const dp = QUESTIONS.filter(q => q.section === "DP").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const pa = QUESTIONS.filter(q => q.section === "PA").reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const total = ee + dp + pa;
    
    return { ee, dp, pa, total };
  };

  const getBurnoutLevel = (score: number) => {
    return BURNOUT_LEVELS.find(level => score >= level.min && score <= level.max) || BURNOUT_LEVELS[0];
  };

  if (showResults) {
    const { ee, dp, pa, total } = savedResults ? savedResults.scores : calculateScores();
    const level = getBurnoutLevel(total);

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

            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Overall Burnout Score</p>
                <p className="text-5xl font-bold text-primary mb-2">{total}</p>
                <p className="text-sm text-muted-foreground">out of 132</p>
              </div>

              {/* Burnout Level */}
              <div className={`p-6 rounded-lg border-2 ${level.color} bg-background`}>
                <h2 className={`text-2xl font-bold mb-3 ${level.color}`}>{level.title}</h2>
                <p className="text-foreground">{level.description}</p>
              </div>

              {/* Detailed Scores */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Emotional Exhaustion</p>
                  <p className="text-2xl font-bold">{ee}</p>
                  <p className="text-xs text-muted-foreground">out of 54</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Depersonalization</p>
                  <p className="text-2xl font-bold">{dp}</p>
                  <p className="text-xs text-muted-foreground">out of 30</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Personal Accomplishment</p>
                  <p className="text-2xl font-bold">{pa}</p>
                  <p className="text-xs text-muted-foreground">out of 48</p>
                </div>
              </div>

              {savedResults && (
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Completed: {new Date(savedResults.completedAt).toLocaleDateString()} at {new Date(savedResults.completedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}

              <Button onClick={() => navigate("/employee")} className="w-full" size="lg">
                View Your Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen gradient-employee">
      <NavBar />
      
      <div className="px-6 py-8 mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-semibold">Burnout Test</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-8">{question.text}</h2>

          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {SCALE_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={`q${question.id}-${option.value}`} />
                <Label
                  htmlFor={`q${question.id}-${option.value}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  <span className="font-medium mr-2">{option.value}</span> - {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex-1"
          >
            {isLastQuestion ? "View Results" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BurnoutTest;
