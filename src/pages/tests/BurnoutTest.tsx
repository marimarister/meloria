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
import { useLanguage } from "@/contexts/LanguageContext";

const BurnoutTest = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [savedResults, setSavedResults] = useState<any>(null);

  const SCALE_OPTIONS = [
    { value: 0, label: t('tests.burnout.never') },
    { value: 1, label: t('tests.burnout.fewTimesYear') },
    { value: 2, label: t('tests.burnout.onceMonth') },
    { value: 3, label: t('tests.burnout.fewTimesMonth') },
    { value: 4, label: t('tests.burnout.onceWeek') },
    { value: 5, label: t('tests.burnout.fewTimesWeek') },
    { value: 6, label: t('tests.burnout.everyDay') },
  ];

  const SCALE_OPTIONS_PA = [
    { value: 6, label: t('tests.burnout.never') },
    { value: 5, label: t('tests.burnout.fewTimesYear') },
    { value: 4, label: t('tests.burnout.onceMonth') },
    { value: 3, label: t('tests.burnout.fewTimesMonth') },
    { value: 2, label: t('tests.burnout.onceWeek') },
    { value: 1, label: t('tests.burnout.fewTimesWeek') },
    { value: 0, label: t('tests.burnout.everyDay') },
  ];

  const QUESTIONS = [
    { id: 1, text: t('tests.burnout.q1'), section: "EE" },
    { id: 2, text: t('tests.burnout.q2'), section: "EE" },
    { id: 3, text: t('tests.burnout.q3'), section: "EE" },
    { id: 4, text: t('tests.burnout.q4'), section: "EE" },
    { id: 5, text: t('tests.burnout.q5'), section: "EE" },
    { id: 6, text: t('tests.burnout.q6'), section: "EE" },
    { id: 7, text: t('tests.burnout.q7'), section: "EE" },
    { id: 8, text: t('tests.burnout.q8'), section: "EE" },
    { id: 9, text: t('tests.burnout.q9'), section: "EE" },
    { id: 10, text: t('tests.burnout.q10'), section: "DP" },
    { id: 11, text: t('tests.burnout.q11'), section: "DP" },
    { id: 12, text: t('tests.burnout.q12'), section: "DP" },
    { id: 13, text: t('tests.burnout.q13'), section: "DP" },
    { id: 14, text: t('tests.burnout.q14'), section: "DP" },
    { id: 15, text: t('tests.burnout.q15'), section: "PA" },
    { id: 16, text: t('tests.burnout.q16'), section: "PA" },
    { id: 17, text: t('tests.burnout.q17'), section: "PA" },
    { id: 18, text: t('tests.burnout.q18'), section: "PA" },
    { id: 19, text: t('tests.burnout.q19'), section: "PA" },
    { id: 20, text: t('tests.burnout.q20'), section: "PA" },
    { id: 21, text: t('tests.burnout.q21'), section: "PA" },
    { id: 22, text: t('tests.burnout.q22'), section: "PA" },
  ];

  const BURNOUT_LEVELS = [
    { min: 0, max: 22, title: t('tests.burnout.perfectWellbeing'), description: t('tests.burnout.perfectWellbeingDesc'), color: "text-green-600" },
    { min: 23, max: 44, title: t('tests.burnout.balancedResilient'), description: t('tests.burnout.balancedResilientDesc'), color: "text-blue-600" },
    { min: 45, max: 66, title: t('tests.burnout.mildFatigue'), description: t('tests.burnout.mildFatigueDesc'), color: "text-yellow-600" },
    { min: 67, max: 88, title: t('tests.burnout.noticeableBurnout'), description: t('tests.burnout.noticeableBurnoutDesc'), color: "text-orange-600" },
    { min: 89, max: 110, title: t('tests.burnout.severeBurnout'), description: t('tests.burnout.severeBurnoutDesc'), color: "text-red-600" },
    { min: 111, max: 132, title: t('tests.burnout.extremeBurnout'), description: t('tests.burnout.extremeBurnoutDesc'), color: "text-red-800" },
  ];

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthChecking) return;
    
    const checkExistingResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
          localStorage.removeItem('burnoutTest');
        }
        return;
      }
      
      const stored = localStorage.getItem('burnoutTest');
      if (stored) {
        const localData = JSON.parse(stored);
        setSavedResults(localData);
        setShowResults(true);
      }
    };
    
    checkExistingResults();
  }, [isAuthChecking]);

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen gradient-employee flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    const scores = calculateScores();
    const completedAt = new Date().toISOString();
    const results = {
      scores,
      completedAt,
      completed: true
    };
    
    localStorage.setItem('burnoutTest', JSON.stringify(results));
    
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

            <h1 className="text-3xl font-bold text-center mb-2">{t('tests.testCompleted')}</h1>
            <p className="text-center text-muted-foreground mb-8">{t('tests.yourResults')}</p>

            <Card className="p-6 mb-8">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">{t('tests.totalScore')}</p>
                <p className="text-5xl font-bold text-primary mb-1">{scores.total}</p>
                <p className="text-sm text-muted-foreground">{t('tests.of')} 132</p>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${level.color} bg-background mb-6`}>
                <h2 className={`text-xl font-bold mb-2 ${level.color}`}>{level.title}</h2>
                <p className="text-sm text-foreground">{level.description}</p>
              </div>

              <div className="relative pt-8 pb-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
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

            <div className="space-y-4 mb-8">
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">{t('tests.emotionalExhaustion')}</h3>
                    <div className="text-sm text-muted-foreground">{scores.emotionalExhaustion} {t('tests.of')} 54</div>
                  </div>
                  
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
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

              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">{t('tests.depersonalization')}</h3>
                    <div className="text-sm text-muted-foreground">{scores.depersonalization} {t('tests.of')} 30</div>
                  </div>
                  
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
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

              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
                  <div className="w-full md:w-[30%] space-y-2">
                    <h3 className="text-base md:text-lg font-semibold">{t('tests.personalAccomplishment')}</h3>
                    <div className="text-sm text-muted-foreground">{scores.personalAccomplishment} {t('tests.of')} 48</div>
                  </div>
                  
                  <div className="flex-1 relative pt-8 pb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
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
                  {t('employee.completedOn')} {new Date(savedResults.completedAt).toLocaleDateString()} at {new Date(savedResults.completedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            <Button onClick={() => navigate("/employee")} className="w-full" size="lg">
              {t('tests.backToDashboard')}
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
              {t('tests.question')}: {Object.keys(answers).length} {t('tests.of')} {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">{t('tests.burnout.instructions')}</h2>

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
            disabled={Object.keys(answers).length < QUESTIONS.length}
            className="w-full mt-8"
            size="lg"
          >
            {t('tests.viewResults')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default BurnoutTest;