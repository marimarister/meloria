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
  options?: string[];
}

const questionnaireData: Record<string, { title: string; description: string; questions: Question[] }> = {
  burnout: {
    title: "Burnout Test",
    description: "Maslach Burnout Inventory - 22 items",
    questions: Array.from({ length: 22 }, (_, i) => ({
      id: `burnout-q${i + 1}`,
      text: `Burnout question ${i + 1}`,
      options: ["Never", "A few times a year or less", "Once a month or less", "A few times a month", "Once a week", "A few times a week", "Every day"]
    }))
  },
  perception: {
    title: "Channel Perception Test",
    description: "VAK+D assessment - 10 items",
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `perception-q${i + 1}`,
      text: `Perception question ${i + 1}`,
      options: ["Visual", "Auditory", "Kinesthetic", "Digital"]
    }))
  },
  preference: {
    title: "Work Preferences & Motivation Test",
    description: "8 questions across 4 sections",
    questions: Array.from({ length: 8 }, (_, i) => ({
      id: `preference-q${i + 1}`,
      text: `Preference question ${i + 1}`,
      options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    }))
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
        {questions.map((question, qIndex) => (
          <Card key={question.id} className="p-6">
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
        ))}
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
