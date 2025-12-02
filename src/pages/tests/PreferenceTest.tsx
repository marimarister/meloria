import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Home, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: number;
  text: string;
  section: 'solo_group' | 'online_offline' | 'stability_flexibility' | 'dynamic_harmony';
  reverse?: boolean;
}

const questions: Question[] = [
  {
    id: 1,
    text: "I prefer to problem-solve on my own.",
    section: 'solo_group',
    reverse: false
  },
  {
    id: 2,
    text: "I get motivated when collaborating with others.",
    section: 'solo_group',
    reverse: true
  },
  {
    id: 3,
    text: "I prefer face-to-face meetings and an atmosphere",
    section: 'online_offline',
    reverse: false
  },
  {
    id: 4,
    text: "I like online (Teams/Zoom) meetings",
    section: 'online_offline',
    reverse: true
  },
  {
    id: 5,
    text: "I am most motivated when I see clear, measurable results from my work.",
    section: 'stability_flexibility',
    reverse: false
  },
  {
    id: 6,
    text: "I prefer tasks that require creativity and innovation.",
    section: 'stability_flexibility',
    reverse: true
  },
  {
    id: 7,
    text: "I prefer a dynamic, eventful atmosphere to calm, harmonious practices.",
    section: 'dynamic_harmony',
    reverse: false
  },
  {
    id: 8,
    text: "I prefer gentle, restorative practices to intense challenges.",
    section: 'dynamic_harmony',
    reverse: true
  }
];

const scaleOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

const getInterpretation = (scores: Record<string, number>) => {
  const results = {
    solo_group: scores.solo_group >= 5 ? 'solo' : 'group',
    online_offline: scores.online_offline >= 5 ? 'offline' : 'online',
    stability_flexibility: scores.stability_flexibility >= 5 ? 'stability' : 'flexibility',
    dynamic_harmony: scores.dynamic_harmony >= 5 ? 'dynamic' : 'harmony'
  };

  const descriptions = {
    solo: {
      title: "Independent Worker",
      description: "You thrive when you have autonomy and space to make your own decisions. Independent projects, self-led tasks, and flexible work arrangements help you bring out your best."
    },
    group: {
      title: "Team Player",
      description: "You draw energy from collaboration and shared goals. Working in a supportive team, brainstorming, and group projects are especially motivating for you."
    },
    flexibility: {
      title: "Lifelong Learner",
      description: "You love new challenges and continuous growth. Opportunities for learning, skill development, and stepping outside your comfort zone keep you engaged."
    },
    stability: {
      title: "Structure & Stability Seeker",
      description: "You feel at ease when your environment is organized and predictable. Clear routines, guidelines, and well-defined roles help you stay focused and confident."
    },
    online: {
      title: "Digital Navigator",
      description: "You're at your best when working through screens and digital tools. Online collaboration, virtual spaces, and tech-driven workflows help you stay efficient, connected, and fully in your element."
    },
    offline: {
      title: "In-Person Engager",
      description: "You thrive in real-world environments where you can interact face-to-face. Hands-on tasks, physical spaces, and direct human connection help you stay focused and energized."
    },
    dynamic: {
      title: "Adaptive Go-Getter",
      description: "You flourish when things are moving and changing. Fast-paced tasks, evolving challenges, and opportunities to shift gears quickly keep you motivated and performing at your best."
    },
    harmony: {
      title: "Steady Collaborator",
      description: "You feel most comfortable in calm, well-balanced environments. Consistent routines, supportive interactions, and a peaceful pace help you stay grounded and confident."
    }
  };

  return {
    solo_group: descriptions[results.solo_group],
    online_offline: descriptions[results.online_offline],
    stability_flexibility: descriptions[results.stability_flexibility],
    dynamic_harmony: descriptions[results.dynamic_harmony]
  };
};

const PreferenceTest = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'test' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [savedResults, setSavedResults] = useState<any>(null);

  useEffect(() => {
    const checkExistingResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - database is the source of truth
        // Check database for burnout test
        const { data: burnoutData } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .eq("test_type", "burnout")
          .single();
        
        if (!burnoutData) {
          // No burnout test in database - redirect
          localStorage.removeItem('burnoutTest');
          navigate('/employee');
          return;
        }
        
        // Check if this test already completed in database
        const { data: preferenceData } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .eq("test_type", "preference")
          .single();
        
        if (preferenceData) {
          setSavedResults({
            scores: preferenceData.scores,
            completedAt: preferenceData.completed_at,
            completed: true
          });
          setStage('results');
        } else {
          // Database doesn't have this test - clear localStorage (admin may have reset)
          localStorage.removeItem('preferenceTest');
        }
        return;
      }
      
      // No user - fallback to localStorage
      const burnoutTest = localStorage.getItem('burnoutTest');
      if (!burnoutTest) {
        navigate('/employee');
        return;
      }

      const stored = localStorage.getItem('preferenceTest');
      if (stored) {
        const data = JSON.parse(stored);
        setSavedResults(data);
        setStage('results');
      }
    };
    
    checkExistingResults();
  }, [navigate]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {
      solo_group: 0,
      online_offline: 0,
      stability_flexibility: 0,
      dynamic_harmony: 0
    };

    questions.forEach(q => {
      const answer = answers[q.id] || 0;
      const score = q.reverse ? (6 - answer) : answer;
      scores[q.section] += score;
    });

    return scores;
  };

  const handleSubmit = async () => {
    const scores = calculateScores();
    const completedAt = new Date().toISOString();
    const results = {
      scores,
      completedAt,
      completed: true
    };
    
    // Save to localStorage for backward compatibility
    localStorage.setItem('preferenceTest', JSON.stringify(results));
    
    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("test_results").upsert({
        user_id: user.id,
        test_type: "preference",
        scores: scores,
        completed_at: completedAt
      }, { onConflict: 'user_id,test_type' });
    }
    
    setSavedResults(results);
    setStage('results');
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  if (stage === 'intro') {
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        
        <div className="px-6 py-8 mx-auto max-w-4xl">

          <Card className="p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Work Preferences & Motivation Test</h1>
            <p className="text-lg text-muted-foreground mb-6">
              This test helps identify your core work preferences and what motivates you most in a professional environment. Use the results to personalize your development and wellbeing strategies.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm mb-4">
                <strong>Instructions:</strong> For each statement, rate how much you agree using the scale from Strongly Disagree to Strongly Agree.
              </p>
              <p className="text-sm">
                <strong>Tip:</strong> Share your results with your team or coach to create a more supportive and motivating work environment!
              </p>
            </div>

            <Button onClick={() => setStage('test')} className="w-full" size="lg">
              Start Test
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
              <h1 className="text-3xl font-bold mb-2">Your Results</h1>
              <p className="text-muted-foreground">Work Preferences & Motivation Test</p>
            </div>

            <div className="space-y-6 mb-8">
              {Object.entries(interpretation).map(([key, value]) => (
                <div key={key} className="p-6 rounded-lg bg-muted/50">
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 p-4 rounded-lg mb-6">
              <p className="text-sm">
                <strong>Use your top motivators to guide your career and wellbeing choices.</strong>
              </p>
            </div>

            {savedResults && (
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Completed: {new Date(savedResults.completedAt).toLocaleDateString()} at {new Date(savedResults.completedAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            <Button onClick={() => navigate('/employee')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
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

        <Card className="p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">Please rate each statement</h2>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <div className="space-y-6">
                  <p className="font-medium">
                    {index + 1}. {question.text}
                  </p>
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                  >
                    <div className="flex gap-2 justify-between">
                      {scaleOptions.map((option) => (
                        <div key={option.value} className="flex flex-col items-center gap-2 flex-1">
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`q${question.id}-${option.value}`}
                          />
                          <Label
                            htmlFor={`q${question.id}-${option.value}`}
                            className="text-xs text-center cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
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

export default PreferenceTest;
