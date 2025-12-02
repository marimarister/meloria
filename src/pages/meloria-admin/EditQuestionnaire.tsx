import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  options: string[];
  section?: string;
}

// Synced with BurnoutTest.tsx
const burnoutQuestions: Question[] = [
  // Emotional Exhaustion (1-9)
  { id: "burnout-q1", text: "I feel emotionally drained from my work.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q2", text: "I feel used up at the end of the workday.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q3", text: "I feel fatigued when I get up in the morning and have to face another day on the job.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q4", text: "Working with people all day is really a strain for me.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q5", text: "I feel burned out from my work.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q6", text: "I feel frustrated by my job.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q7", text: "I feel I'm working too hard on my job.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q8", text: "Working with people directly puts too much stress on me.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q9", text: "I feel like I'm at the end of my rope.", section: "EE", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  // Depersonalization (10-14)
  { id: "burnout-q10", text: "I feel I treat some recipients as if they were impersonal objects.", section: "DP", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q11", text: "I've become more callous toward people since I took this job.", section: "DP", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q12", text: "I worry that this job is hardening me emotionally.", section: "DP", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q13", text: "I don't really care what happens to some recipients.", section: "DP", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q14", text: "I feel recipients blame me for some of their problems.", section: "DP", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  // Personal Accomplishment (15-22) - Note: Uses reversed scale in actual test
  { id: "burnout-q15", text: "I can easily understand how my recipients feel about things.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q16", text: "I deal very effectively with the problems of my recipients.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q17", text: "I feel I'm positively influencing other people's lives through my work.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q18", text: "I feel very energetic.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q19", text: "I can easily create a relaxed atmosphere with my recipients.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q20", text: "I feel exhilarated after working closely with my recipients.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q21", text: "I have accomplished many worthwhile things in this job.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
  { id: "burnout-q22", text: "In my work, I deal with emotional problems very calmly.", section: "PA", options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"] },
];

// Synced with ChannelPerceptionTest.tsx
const perceptionQuestions: Question[] = [
  { id: "perception-q1", text: "When learning something new, I prefer to:", options: ["See diagrams, charts, or pictures", "Listen to explanations or discussions", "Try it out myself, hands-on", "Read step-by-step instructions"] },
  { id: "perception-q2", text: "I remember things best when I:", options: ["Visualize them in my mind", "Repeat them aloud or hear them", "Practice or physically do them", "Write lists or structured notes"] },
  { id: "perception-q3", text: "In a meeting, I:", options: ["Like slides, graphs, or visuals", "Prefer to listen to the speaker", "Need to move or doodle to focus", "Want an agenda or summary in writing"] },
  { id: "perception-q4", text: "When following directions, I:", options: ["Look at a map or diagram", "Ask someone to explain verbally", "Like to walk through the route", "Read written instructions"] },
  { id: "perception-q5", text: "My favorite way to relax is:", options: ["Watching movies or looking at art", "Listening to music or podcasts", "Sports, dancing, or hands-on hobbies", "Reading or doing puzzles"] },
  { id: "perception-q6", text: "When stressed, I:", options: ["Visualize a calm place", "Talk to someone or listen to soothing sounds", "Go for a walk or do something physical", "Make a plan or list"] },
  { id: "perception-q7", text: "In a workshop, I:", options: ["Like handouts and visuals", "Enjoy group discussions", "Prefer interactive activities", "Value clear, logical instructions"] },
  { id: "perception-q8", text: "When shopping for something new, I:", options: ["Look at the design and appearance", "Ask for recommendations", "Try it out or touch it", "Read product specs or reviews"] },
  { id: "perception-q9", text: "My notes are usually:", options: ["Filled with sketches, color, or diagrams", "Written as reminders to say aloud", "Brief, with action steps", "Detailed and organized"] },
  { id: "perception-q10", text: "I solve problems by:", options: ["Drawing or mapping out ideas", "Talking them through", "Experimenting or trying different things", "Analyzing and structuring information"] },
];

// Synced with PreferenceTest.tsx
const preferenceQuestions: Question[] = [
  { id: "preference-q1", text: "I prefer to problem-solve on my own.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q2", text: "I get motivated when collaborating with others.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q3", text: "I prefer face-to-face meetings and an atmosphere", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q4", text: "I like online (Teams/Zoom) meetings", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q5", text: "I am most motivated when I see clear, measurable results from my work.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q6", text: "I prefer tasks that require creativity and innovation.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q7", text: "I prefer a dynamic, eventful atmosphere to calm, harmonious practices.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
  { id: "preference-q8", text: "I prefer gentle, restorative practices to intense challenges.", options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
];

const questionnaireData: Record<string, { title: string; description: string; questions: Question[] }> = {
  burnout: {
    title: "Burnout Test",
    description: "Maslach Burnout Inventory - 22 items measuring emotional exhaustion, depersonalization, and personal accomplishment",
    questions: burnoutQuestions
  },
  perception: {
    title: "Channel Perception Test",
    description: "VAK+D assessment - 10 items to determine learning and communication preferences (Visual, Auditory, Kinesthetic, Digital)",
    questions: perceptionQuestions
  },
  preference: {
    title: "Work Preferences & Motivation Test",
    description: "8 questions across 4 sections mapping to eight personality archetypes",
    questions: preferenceQuestions
  }
};

const EditQuestionnaire = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const data = type ? questionnaireData[type] : null;
  const [questions, setQuestions] = useState<Question[]>(data?.questions || []);

  if (!data) {
    return <div className="p-8">Questionnaire not found</div>;
  }

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, "New option"] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
      }
      return q;
    }));
  };

  const handleSave = () => {
    // TODO: Save to database
    toast.success("Questionnaire updated successfully");
    navigate("/meloria-admin/questionnaires");
  };

  const getSectionLabel = (section?: string) => {
    switch (section) {
      case "EE": return "Emotional Exhaustion";
      case "DP": return "Depersonalization";
      case "PA": return "Personal Accomplishment";
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/meloria-admin/questionnaires")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Questionnaires
      </Button>

      <h1 className="text-4xl font-bold mb-2">{data.title}</h1>
      <p className="text-muted-foreground mb-8">{data.description}</p>

      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const sectionLabel = getSectionLabel(question.section);
          const prevSection = qIndex > 0 ? questions[qIndex - 1].section : null;
          const showSectionHeader = question.section && question.section !== prevSection;

          return (
            <div key={question.id}>
              {showSectionHeader && sectionLabel && (
                <div className="mb-4 mt-8">
                  <h2 className="text-xl font-semibold text-primary">{sectionLabel}</h2>
                </div>
              )}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Question {qIndex + 1}</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                      rows={2}
                    />
                  </div>

                  {question.options && (
                    <div>
                      <Label className="mb-2 block">Answer Options</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(question.id, optIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(question.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-8">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button variant="outline" onClick={() => navigate("/meloria-admin/questionnaires")}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditQuestionnaire;
