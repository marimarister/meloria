import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingDown, 
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import NavBar from "@/components/NavBar";

const HRDashboard = () => {
  // Mock data - will be replaced with real data from backend
  const stats = {
    totalEmployees: 150,
    completedTests: 45,
    completionRate: 30,
    averageBurnoutScore: 42,
    riskCategories: {
      low: 15,
      moderate: 20,
      high: 10
    }
  };

  return (
    <div className="min-h-screen gradient-hr">
      <NavBar />
      
      <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">
            HR Analytics Dashboard
          </h1>
          <p className="text-lg text-white/80">
            Monitor organizational wellness and drive data-informed decisions
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalEmployees}</p>
          </Card>

          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Tests Completed</p>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.completedTests}</p>
            <Progress value={stats.completionRate} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">{stats.completionRate}% completion rate</p>
          </Card>

          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Burnout Score</p>
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.averageBurnoutScore}/100</p>
            <p className="text-xs text-warning mt-2">Moderate risk level</p>
          </Card>

          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.riskCategories.high}</p>
            <p className="text-xs text-muted-foreground mt-2">Employees need attention</p>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Assessment Completion Details - Moved here */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Assessment Completion Details</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Burnout Test</p>
                <p className="text-2xl font-bold mb-1">{stats.completedTests}</p>
                <Progress value={stats.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{stats.completionRate}% completed</p>
              </div>

              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Channel Perception Test</p>
                <p className="text-2xl font-bold mb-1">{stats.completedTests}</p>
                <Progress value={stats.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{stats.completionRate}% completed</p>
              </div>

              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Preference Test</p>
                <p className="text-2xl font-bold mb-1">{stats.completedTests}</p>
                <Progress value={stats.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{stats.completionRate}% completed</p>
              </div>
            </div>
          </Card>

          {/* Suggested Activities */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Recommended Team Actions</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Weekly Wellness Check-ins</h3>
                <p className="text-sm text-muted-foreground">
                  Based on moderate burnout levels, schedule brief one-on-ones to discuss workload
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Team Building Activities</h3>
                <p className="text-sm text-muted-foreground">
                  Foster connection with collaborative activities to reduce isolation
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Flexible Work Options</h3>
                <p className="text-sm text-muted-foreground">
                  Consider hybrid schedules to improve work-life balance
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Mental Health Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Share information about employee assistance programs and wellness resources
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Burnout Risk Distribution - Moved to bottom, full width */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Burnout Risk Distribution</h2>
          <div className="flex justify-between text-xl text-muted-foreground mb-4">
            <span>Level</span>
            <span>Amount of Employees</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  <span className="font-medium">Low Risk (0-30)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.low}</span>
              </div>
              <Progress value={(stats.riskCategories.low / stats.completedTests) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-warning" />
                  <span className="font-medium">Moderate Risk (31-60)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.moderate}</span>
              </div>
              <Progress value={(stats.riskCategories.moderate / stats.completedTests) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  <span className="font-medium">High Risk (61-100)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.high}</span>
              </div>
              <Progress value={(stats.riskCategories.high / stats.completedTests) * 100} className="h-2" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
