import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye, Ear, Hand, Binary, Home, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";

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

const questions: Question[] = [
  {
    id: 1,
    text: "When learning something new, I prefer to:",
    options: [
      { label: "a", text: "See diagrams, charts, or pictures", channel: "V" },
      { label: "b", text: "Listen to explanations or discussions", channel: "A" },
      { label: "c", text: "Try it out myself, hands-on", channel: "K" },
      { label: "d", text: "Read step-by-step instructions", channel: "D" }
    ]
  },
  {
    id: 2,
    text: "I remember things best when I:",
    options: [
      { label: "a", text: "Visualize them in my mind", channel: "V" },
      { label: "b", text: "Repeat them aloud or hear them", channel: "A" },
      { label: "c", text: "Practice or physically do them", channel: "K" },
      { label: "d", text: "Write lists or structured notes", channel: "D" }
    ]
  },
  {
    id: 3,
    text: "In a meeting, I:",
    options: [
      { label: "a", text: "Like slides, graphs, or visuals", channel: "V" },
      { label: "b", text: "Prefer to listen to the speaker", channel: "A" },
      { label: "c", text: "Need to move or doodle to focus", channel: "K" },
      { label: "d", text: "Want an agenda or summary in writing", channel: "D" }
    ]
  },
  {
    id: 4,
    text: "When following directions, I:",
    options: [
      { label: "a", text: "Look at a map or diagram", channel: "V" },
      { label: "b", text: "Ask someone to explain verbally", channel: "A" },
      { label: "c", text: "Like to walk through the route", channel: "K" },
      { label: "d", text: "Read written instructions", channel: "D" }
    ]
  },
  {
    id: 5,
    text: "My favorite way to relax is:",
    options: [
      { label: "a", text: "Watching movies or looking at art", channel: "V" },
      { label: "b", text: "Listening to music or podcasts", channel: "A" },
      { label: "c", text: "Sports, dancing, or hands-on hobbies", channel: "K" },
      { label: "d", text: "Reading or doing puzzles", channel: "D" }
    ]
  },
  {
    id: 6,
    text: "When stressed, I:",
    options: [
      { label: "a", text: "Visualize a calm place", channel: "V" },
      { label: "b", text: "Talk to someone or listen to soothing sounds", channel: "A" },
      { label: "c", text: "Go for a walk or do something physical", channel: "K" },
      { label: "d", text: "Make a plan or list", channel: "D" }
    ]
  },
  {
    id: 7,
    text: "In a workshop, I:",
    options: [
      { label: "a", text: "Like handouts and visuals", channel: "V" },
      { label: "b", text: "Enjoy group discussions", channel: "A" },
      { label: "c", text: "Prefer interactive activities", channel: "K" },
      { label: "d", text: "Value clear, logical instructions", channel: "D" }
    ]
  },
  {
    id: 8,
    text: "When shopping for something new, I:",
    options: [
      { label: "a", text: "Look at the design and appearance", channel: "V" },
      { label: "b", text: "Ask for recommendations", channel: "A" },
      { label: "c", text: "Try it out or touch it", channel: "K" },
      { label: "d", text: "Read product specs or reviews", channel: "D" }
    ]
  },
  {
    id: 9,
    text: "My notes are usually:",
    options: [
      { label: "a", text: "Filled with sketches, color, or diagrams", channel: "V" },
      { label: "b", text: "Written as reminders to say aloud", channel: "A" },
      { label: "c", text: "Brief, with action steps", channel: "K" },
      { label: "d", text: "Detailed and organized", channel: "D" }
    ]
  },
  {
    id: 10,
    text: "I solve problems by:",
    options: [
      { label: "a", text: "Drawing or mapping out ideas", channel: "V" },
      { label: "b", text: "Talking them through", channel: "A" },
      { label: "c", text: "Experimenting or trying different things", channel: "K" },
      { label: "d", text: "Analyzing and structuring information", channel: "D" }
    ]
  }
];

const channelInfo = {
  V: {
    icon: Eye,
    name: "Visual",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  A: {
    icon: Ear,
    name: "Auditory",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  K: {
    icon: Hand,
    name: "Kinesthetic",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  D: {
    icon: Binary,
    name: "Digital",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  }
};

const getInterpretation = (scores: Record<ChannelType, number>) => {
  const maxScore = Math.max(...Object.values(scores));
  const dominantChannels = (Object.keys(scores) as ChannelType[]).filter(
    channel => scores[channel] === maxScore
  );

  if (dominantChannels.length === 1) {
    const channel = dominantChannels[0];
    const interpretations = {
      V: {
        title: "The Visual Learner",
        description: "You process information best through images, diagrams, colors, and visual cues. When learning or working, use charts, mind maps, and visual materials. Surround yourself with inspiring visuals and organize information in a way that's easy to see at a glance."
      },
      A: {
        title: "The Auditory Communicator",
        description: "You learn and remember best by listening and speaking. Discussions, podcasts, and verbal instructions work well for you. Try recording notes, participating in group conversations, and using music or rhythm to help memorize and process information."
      },
      K: {
        title: "The Experiential Explorer",
        description: "You thrive through hands-on experience, movement, and touch. Practice by doing, use role-play, or incorporate physical activity into your learning. Take frequent breaks to move, and use real-life examples or models to understand new concepts."
      },
      D: {
        title: "The Analytical Thinker",
        description: "You excel with logical, structured, and step-by-step information. You like written instructions, lists, and frameworks. Organize your work with plans and checklists, and break complex tasks into clear, manageable steps. Analytical tools and structured routines will support your growth."
      }
    };
    return interpretations[channel];
  }

  // Combination results
  if (dominantChannels.length === 2) {
    const combo = dominantChannels.sort().join('');
    const combinations: Record<string, { title: string; description: string }> = {
      'AV': {
        title: "The Visual Listener",
        description: "You learn best when you can both see and hear information. Combine visual materials with verbal explanations for optimal results. Consider using videos with narration or presenting information with both slides and discussion."
      },
      'KV': {
        title: "The Creative Doer",
        description: "You learn best when you can both see and physically engage with information. Combine visual materials with hands-on practice for optimal results. Use diagrams while practicing, or create visual representations through physical activities."
      },
      'DV': {
        title: "The Structured Visualizer",
        description: "You process information well by combining visual organization with logical structure. Use flowcharts, organized diagrams, and structured visual frameworks to optimize your learning and work."
      },
      'AK': {
        title: "The Active Communicator",
        description: "You excel when combining verbal discussion with physical engagement. Try talking through problems while moving, or participate in interactive group activities. Role-play and hands-on discussions work well for you."
      },
      'AD': {
        title: "The Logical Listener",
        description: "You process information well by listening and then organizing it in a clear, structured way. Try summarizing conversations into lists or diagrams. Record lectures and create structured notes from them."
      },
      'DK': {
        title: "The Practical Analyst",
        description: "You combine analytical thinking with hands-on experience. You like to understand the logic behind tasks and then practice them systematically. Use structured experiments and step-by-step practical exercises."
      }
    };
    return combinations[combo] || {
      title: "The Balanced Learner",
      description: "You have strengths in multiple learning styles, which gives you flexibility in how you process information. Use a combination of approaches to maximize your learning and wellbeing."
    };
  }

  return {
    title: "The Balanced Learner",
    description: "You have strengths across multiple learning styles, which gives you great flexibility in how you process information. Use a combination of approaches to maximize your learning and wellbeing."
  };
};

const ChannelPerceptionTest = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'test' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, ChannelType>>({});
  const [savedResults, setSavedResults] = useState<any>(null);

  useEffect(() => {
    // Check if Burnout Test is completed
    const burnoutTest = localStorage.getItem('burnoutTest');
    if (!burnoutTest) {
      navigate('/employee');
      return;
    }

    // Check if this test already completed
    const stored = localStorage.getItem('channelPerceptionTest');
    if (stored) {
      const data = JSON.parse(stored);
      setSavedResults(data);
      setStage('results');
    }
  }, [navigate]);

  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleNext = () => {
    const scores = calculateScores();
    const results = {
      scores,
      completedAt: new Date().toISOString(),
      completed: true
    };
    localStorage.setItem('channelPerceptionTest', JSON.stringify(results));
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

  if (stage === 'intro') {
    return (
      <div className="min-h-screen gradient-employee">
        <NavBar />
        
        <div className="px-6 py-8 mx-auto max-w-4xl">
          <Card className="p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Channel Perception Test</h1>
            <p className="text-lg text-muted-foreground mb-8">
              This test helps identify your dominant learning and communication style:
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-500 mb-1">Visual (V)</h3>
                  <p className="text-sm text-muted-foreground">Learn through images, diagrams, and visual cues</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Ear className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-500 mb-1">Auditory (A)</h3>
                  <p className="text-sm text-muted-foreground">Learn through listening and speaking</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Hand className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-500 mb-1">Kinesthetic (K)</h3>
                  <p className="text-sm text-muted-foreground">Learn through hands-on experience and movement</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/10">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Binary className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-500 mb-1">Digital (D)</h3>
                  <p className="text-sm text-muted-foreground">Learn through logical, structured information</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm">
                <strong>Instructions:</strong> For each question, select the option that best describes you. 
                The test takes approximately 3-5 minutes to complete.
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
              <p className="text-muted-foreground">Channel Perception Test</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{interpretation.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{interpretation.description}</p>
            </div>

            <div className="grid gap-4 mb-8">
              {(Object.entries(scores) as [ChannelType, number][]).map(([channel, score]) => {
                const info = channelInfo[channel];
                const Icon = info.icon;
                const percentage = (score / questions.length) * 100;

                return (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${info.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${info.color}`} />
                        </div>
                        <span className="font-medium">{info.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{score}/10</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Progress: {Object.keys(answers).length} of {questions.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">Please select the option that best describes you</h2>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="p-6 rounded-lg bg-green-50">
                <p className="font-medium mb-4">
                  {index + 1}. {q.text}
                </p>
                <RadioGroup
                  value={answers[q.id]}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [q.id]: value as ChannelType }))}
                >
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <div
                        key={option.label}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.channel}
                          id={`q${q.id}-${option.label}`}
                        />
                        <Label
                          htmlFor={`q${q.id}-${option.label}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {option.text}
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
            disabled={Object.keys(answers).length !== questions.length}
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

export default ChannelPerceptionTest;
