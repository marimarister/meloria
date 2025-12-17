import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye, Ear, Hand, Binary, Home, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type ChannelType = 'V' | 'A' | 'K' | 'D';

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    text: string;
    channel: ChannelType;
  }[];
}

const getChannelInfo = (t: (key: string) => string) => ({
  V: {
    icon: Eye,
    name: t('tests.perception.visual'),
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  A: {
    icon: Ear,
    name: t('tests.perception.auditory'),
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  K: {
    icon: Hand,
    name: t('tests.perception.kinesthetic'),
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  D: {
    icon: Binary,
    name: t('tests.perception.digital'),
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  }
});

const ChannelPerceptionTest = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [stage, setStage] = useState<'intro' | 'test' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, ChannelType>>({});
  const [savedResults, setSavedResults] = useState<any>(null);

  const questions: Question[] = [
    {
      id: 1,
      text: t('tests.perception.q1'),
      options: [
        { label: "a", text: t('tests.perception.q1a'), channel: "V" },
        { label: "b", text: t('tests.perception.q1b'), channel: "A" },
        { label: "c", text: t('tests.perception.q1c'), channel: "K" },
        { label: "d", text: t('tests.perception.q1d'), channel: "D" }
      ]
    },
    {
      id: 2,
      text: t('tests.perception.q2'),
      options: [
        { label: "a", text: t('tests.perception.q2a'), channel: "V" },
        { label: "b", text: t('tests.perception.q2b'), channel: "A" },
        { label: "c", text: t('tests.perception.q2c'), channel: "K" },
        { label: "d", text: t('tests.perception.q2d'), channel: "D" }
      ]
    },
    {
      id: 3,
      text: t('tests.perception.q3'),
      options: [
        { label: "a", text: t('tests.perception.q3a'), channel: "V" },
        { label: "b", text: t('tests.perception.q3b'), channel: "A" },
        { label: "c", text: t('tests.perception.q3c'), channel: "K" },
        { label: "d", text: t('tests.perception.q3d'), channel: "D" }
      ]
    },
    {
      id: 4,
      text: t('tests.perception.q4'),
      options: [
        { label: "a", text: t('tests.perception.q4a'), channel: "V" },
        { label: "b", text: t('tests.perception.q4b'), channel: "A" },
        { label: "c", text: t('tests.perception.q4c'), channel: "K" },
        { label: "d", text: t('tests.perception.q4d'), channel: "D" }
      ]
    },
    {
      id: 5,
      text: t('tests.perception.q5'),
      options: [
        { label: "a", text: t('tests.perception.q5a'), channel: "V" },
        { label: "b", text: t('tests.perception.q5b'), channel: "A" },
        { label: "c", text: t('tests.perception.q5c'), channel: "K" },
        { label: "d", text: t('tests.perception.q5d'), channel: "D" }
      ]
    },
    {
      id: 6,
      text: t('tests.perception.q6'),
      options: [
        { label: "a", text: t('tests.perception.q6a'), channel: "V" },
        { label: "b", text: t('tests.perception.q6b'), channel: "A" },
        { label: "c", text: t('tests.perception.q6c'), channel: "K" },
        { label: "d", text: t('tests.perception.q6d'), channel: "D" }
      ]
    },
    {
      id: 7,
      text: t('tests.perception.q7'),
      options: [
        { label: "a", text: t('tests.perception.q7a'), channel: "V" },
        { label: "b", text: t('tests.perception.q7b'), channel: "A" },
        { label: "c", text: t('tests.perception.q7c'), channel: "K" },
        { label: "d", text: t('tests.perception.q7d'), channel: "D" }
      ]
    },
    {
      id: 8,
      text: t('tests.perception.q8'),
      options: [
        { label: "a", text: t('tests.perception.q8a'), channel: "V" },
        { label: "b", text: t('tests.perception.q8b'), channel: "A" },
        { label: "c", text: t('tests.perception.q8c'), channel: "K" },
        { label: "d", text: t('tests.perception.q8d'), channel: "D" }
      ]
    },
    {
      id: 9,
      text: t('tests.perception.q9'),
      options: [
        { label: "a", text: t('tests.perception.q9a'), channel: "V" },
        { label: "b", text: t('tests.perception.q9b'), channel: "A" },
        { label: "c", text: t('tests.perception.q9c'), channel: "K" },
        { label: "d", text: t('tests.perception.q9d'), channel: "D" }
      ]
    },
    {
      id: 10,
      text: t('tests.perception.q10'),
      options: [
        { label: "a", text: t('tests.perception.q10a'), channel: "V" },
        { label: "b", text: t('tests.perception.q10b'), channel: "A" },
        { label: "c", text: t('tests.perception.q10c'), channel: "K" },
        { label: "d", text: t('tests.perception.q10d'), channel: "D" }
      ]
    }
  ];

  const getInterpretation = (scores: Record<ChannelType, number>) => {
    const maxScore = Math.max(...Object.values(scores));
    const dominantChannels = (Object.keys(scores) as ChannelType[]).filter(
      channel => scores[channel] === maxScore
    );

    if (dominantChannels.length === 1) {
      const channel = dominantChannels[0];
      const interpretations = {
        V: {
          title: t('tests.perception.visualLearner'),
          description: t('tests.perception.visualLearnerDesc')
        },
        A: {
          title: t('tests.perception.auditoryComm'),
          description: t('tests.perception.auditoryCommDesc')
        },
        K: {
          title: t('tests.perception.kinestheticExp'),
          description: t('tests.perception.kinestheticExpDesc')
        },
        D: {
          title: t('tests.perception.digitalThinker'),
          description: t('tests.perception.digitalThinkerDesc')
        }
      };
      return interpretations[channel];
    }

    return {
      title: t('tests.perception.balancedLearner'),
      description: t('tests.perception.balancedLearnerDesc')
    };
  };

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
        const { data: burnoutData } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .eq("test_type", "burnout")
          .single();
        
        if (!burnoutData) {
          localStorage.removeItem('burnoutTest');
          navigate('/employee');
          return;
        }
        
        const { data: perceptionData } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .eq("test_type", "perception")
          .single();
        
        if (perceptionData) {
          setSavedResults({
            scores: perceptionData.scores,
            completedAt: perceptionData.completed_at,
            completed: true
          });
          setStage('results');
        } else {
          localStorage.removeItem('channelPerceptionTest');
        }
        return;
      }
      
      const burnoutTest = localStorage.getItem('burnoutTest');
      if (!burnoutTest) {
        navigate('/employee');
        return;
      }

      const stored = localStorage.getItem('channelPerceptionTest');
      if (stored) {
        const data = JSON.parse(stored);
        setSavedResults(data);
        setStage('results');
      }
    };
    
    checkExistingResults();
  }, [navigate, isAuthChecking]);

  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleNext = async () => {
    const scores = calculateScores();
    const completedAt = new Date().toISOString();
    const results = {
      scores,
      completedAt,
      completed: true
    };
    
    localStorage.setItem('channelPerceptionTest', JSON.stringify(results));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("test_results").upsert({
        user_id: user.id,
        test_type: "perception",
        scores: scores,
        completed_at: completedAt
      }, { onConflict: 'user_id,test_type' });
    }
    
    setSavedResults(results);
    setStage('results');
  };

  const calculateScores = () => {
    const scores: Record<ChannelType, number> = { V: 0, A: 0, K: 0, D: 0 };
    Object.values(answers).forEach(channel => {
      scores[channel]++;
    });
    return scores;
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen gradient-employee flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        
        <div className="px-6 py-8 mx-auto max-w-4xl">
          <Card className="p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">{t('tests.perception.title')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('tests.perception.introText')}
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-500 mb-1">{t('tests.perception.visual')} (V)</h3>
                  <p className="text-sm text-muted-foreground">{t('tests.perception.visualDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Ear className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-500 mb-1">{t('tests.perception.auditory')} (A)</h3>
                  <p className="text-sm text-muted-foreground">{t('tests.perception.auditoryDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Hand className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-500 mb-1">{t('tests.perception.kinesthetic')} (K)</h3>
                  <p className="text-sm text-muted-foreground">{t('tests.perception.kinestheticDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/10">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Binary className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-500 mb-1">{t('tests.perception.digital')} (D)</h3>
                  <p className="text-sm text-muted-foreground">{t('tests.perception.digitalDesc')}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm">
                <strong>{t('tests.perception.instructionNote')}</strong>
              </p>
            </div>

            <Button onClick={() => setStage('test')} className="w-full" size="lg">
              {t('tests.startTest')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const scores = savedResults ? savedResults.scores : calculateScores();
    const interpretation = getInterpretation(scores);

    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        
        <div className="px-6 py-8 mx-auto max-w-4xl">
          <Card className="p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{t('tests.yourResults')}</h1>
              <p className="text-muted-foreground">{t('tests.perception.title')}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{interpretation.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{interpretation.description}</p>
            </div>

            <div className="grid gap-4 mb-8">
              {(Object.entries(scores) as [ChannelType, number][]).map(([channel, score]) => {
                const channelInfo = getChannelInfo(t);
                const info = channelInfo[channel];
                const Icon = info.icon;
                const percentage = (score / questions.length) * 100;

                return (
                  <div key={channel} className={`p-4 rounded-lg ${info.bgColor}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${info.color}`} />
                      <span className={`font-medium ${info.color}`}>{info.name}</span>
                      <span className="ml-auto text-sm font-bold">{score}/{questions.length}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>

            {savedResults && (
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  {t('employee.completedOn')} {new Date(savedResults.completedAt).toLocaleDateString()} at {new Date(savedResults.completedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            <Button onClick={() => navigate('/employee')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
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
              {t('tests.question')}: {Object.keys(answers).length} {t('tests.of')} {questions.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 animate-fade-in">
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b border-border pb-6 last:border-0">
                <p className="font-medium mb-4">
                  {index + 1}. {question.text}
                </p>
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value as ChannelType }))}
                >
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.label}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.channel}
                          id={`q${question.id}-${option.label}`}
                        />
                        <Label
                          htmlFor={`q${question.id}-${option.label}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {option.label}) {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={Object.keys(answers).length < questions.length}
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

export default ChannelPerceptionTest;