import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingDown, 
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

interface CompanyStats {
  companyName: string;
  totalEmployees: number;
  burnoutCompleted: number;
  perceptionCompleted: number;
  preferenceCompleted: number;
  allTestsCompleted: number;
  averageBurnoutScore: number;
  riskCategories: {
    low: number;      // 0-44 (Perfect Wellbeing + Balanced & Resilient)
    moderate: number; // 45-88 (Mild Fatigue + Noticeable Burnout)
    high: number;     // 89-132 (Severe Burnout + Extreme Burnout Risk)
  };
}

const getBurnoutRiskCategory = (score: number): 'low' | 'moderate' | 'high' => {
  if (score <= 44) return 'low';
  if (score <= 88) return 'moderate';
  return 'high';
};

const getRiskLabel = (averageScore: number): string => {
  if (averageScore <= 44) return 'Low risk level';
  if (averageScore <= 88) return 'Moderate risk level';
  return 'High risk level';
};

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Verify user has 'hr' role server-side
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'hr')
          .maybeSingle();

        if (roleError || !roleData) {
          navigate('/employee');
          return;
        }

        // Get user's profile email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (!profile?.email) {
          setError('Unable to find your profile');
          setIsLoading(false);
          return;
        }

        // Find the company group(s) this user belongs to
        const { data: membershipData, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('email', profile.email)
          .limit(1);

        if (membershipError || !membershipData?.length) {
          setError('You are not assigned to any company group');
          setIsLoading(false);
          return;
        }

        const groupId = membershipData[0].group_id;

        // Get company group name
        const { data: groupData } = await supabase
          .from('company_groups')
          .select('name')
          .eq('id', groupId)
          .single();

        // Get all members in this group
        const { data: groupMembers, error: membersError } = await supabase
          .from('group_members')
          .select('email, name, surname')
          .eq('group_id', groupId);

        if (membersError || !groupMembers) {
          setError('Unable to fetch group members');
          setIsLoading(false);
          return;
        }

        const totalEmployees = groupMembers.length;

        // Get profiles for all group members to get their user IDs
        const memberEmails = groupMembers.map(m => m.email);
        const { data: memberProfiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('email', memberEmails);

        const memberUserIds = memberProfiles?.map(p => p.id) || [];

        // Get all test results for these users
        const { data: testResults } = await supabase
          .from('test_results')
          .select('user_id, test_type, scores')
          .in('user_id', memberUserIds);

        // Calculate stats
        let burnoutCompleted = 0;
        let perceptionCompleted = 0;
        let preferenceCompleted = 0;
        let totalBurnoutScore = 0;
        let burnoutScoreCount = 0;
        const riskCategories = { low: 0, moderate: 0, high: 0 };
        const usersWithAllTests = new Set<string>();

        // Track which tests each user has completed
        const userTestMap: Record<string, Set<string>> = {};

        testResults?.forEach((result) => {
          if (!userTestMap[result.user_id]) {
            userTestMap[result.user_id] = new Set();
          }
          userTestMap[result.user_id].add(result.test_type);

          if (result.test_type === 'burnout') {
            burnoutCompleted++;
            const scores = result.scores as any;
            const totalScore = (scores?.emotionalExhaustion || 0) + 
                             (scores?.depersonalization || 0) + 
                             (scores?.personalAccomplishment || 0);
            totalBurnoutScore += totalScore;
            burnoutScoreCount++;
            riskCategories[getBurnoutRiskCategory(totalScore)]++;
          } else if (result.test_type === 'perception') {
            perceptionCompleted++;
          } else if (result.test_type === 'preference') {
            preferenceCompleted++;
          }
        });

        // Count users who completed all 3 tests
        Object.entries(userTestMap).forEach(([userId, tests]) => {
          if (tests.has('burnout') && tests.has('perception') && tests.has('preference')) {
            usersWithAllTests.add(userId);
          }
        });

        const averageBurnoutScore = burnoutScoreCount > 0 
          ? Math.round(totalBurnoutScore / burnoutScoreCount) 
          : 0;

        setStats({
          companyName: groupData?.name || 'Your Company',
          totalEmployees,
          burnoutCompleted,
          perceptionCompleted,
          preferenceCompleted,
          allTestsCompleted: usersWithAllTests.size,
          averageBurnoutScore,
          riskCategories
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('An error occurred while loading data');
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-company flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen gradient-company">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Company Data</h2>
            <p className="text-muted-foreground">
              {error || 'Unable to load company analytics. Please contact your administrator.'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const burnoutCompletionRate = stats.totalEmployees > 0 
    ? Math.round((stats.burnoutCompleted / stats.totalEmployees) * 100) 
    : 0;
  const perceptionCompletionRate = stats.totalEmployees > 0 
    ? Math.round((stats.perceptionCompleted / stats.totalEmployees) * 100) 
    : 0;
  const preferenceCompletionRate = stats.totalEmployees > 0 
    ? Math.round((stats.preferenceCompleted / stats.totalEmployees) * 100) 
    : 0;
  const allTestsCompletionRate = stats.totalEmployees > 0 
    ? Math.round((stats.allTestsCompleted / stats.totalEmployees) * 100) 
    : 0;

  return (
    <div className="min-h-screen gradient-company">
      <NavBar />
      
      <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-white/80" />
            <h1 className="text-4xl font-bold text-white">
              {stats.companyName}
            </h1>
          </div>
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
              <p className="text-sm font-medium text-muted-foreground">All Tests Completed</p>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.allTestsCompleted}</p>
            <Progress value={allTestsCompletionRate} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">{allTestsCompletionRate}% completion rate</p>
          </Card>

          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Burnout Score</p>
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.averageBurnoutScore}/132</p>
            <p className={`text-xs mt-2 ${
              stats.averageBurnoutScore <= 44 ? 'text-success' : 
              stats.averageBurnoutScore <= 88 ? 'text-warning' : 'text-destructive'
            }`}>
              {getRiskLabel(stats.averageBurnoutScore)}
            </p>
          </Card>

          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.riskCategories.high}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.riskCategories.high === 1 ? 'Employee needs' : 'Employees need'} attention
            </p>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Assessment Completion Details */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Assessment Completion Details</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Burnout Test</p>
                <p className="text-2xl font-bold mb-1">{stats.burnoutCompleted} / {stats.totalEmployees}</p>
                <Progress value={burnoutCompletionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{burnoutCompletionRate}% completed</p>
              </div>

              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Channel Perception Test</p>
                <p className="text-2xl font-bold mb-1">{stats.perceptionCompleted} / {stats.totalEmployees}</p>
                <Progress value={perceptionCompletionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{perceptionCompletionRate}% completed</p>
              </div>

              <div className="p-6 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-2">Work Preferences Test</p>
                <p className="text-2xl font-bold mb-1">{stats.preferenceCompleted} / {stats.totalEmployees}</p>
                <Progress value={preferenceCompletionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{preferenceCompletionRate}% completed</p>
              </div>
            </div>
          </Card>

          {/* Suggested Activities */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Recommended Team Actions</h2>
            <div className="space-y-4">
              {stats.riskCategories.high > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h3 className="font-semibold mb-1 text-destructive">Urgent: High-Risk Employees</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.riskCategories.high} employee{stats.riskCategories.high !== 1 ? 's show' : ' shows'} severe burnout signs. Schedule immediate support check-ins.
                  </p>
                </div>
              )}

              {stats.averageBurnoutScore > 44 && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-1">Weekly Wellness Check-ins</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {stats.averageBurnoutScore > 88 ? 'high' : 'moderate'} burnout levels, schedule brief one-on-ones to discuss workload
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Team Building Activities</h3>
                <p className="text-sm text-muted-foreground">
                  Foster connection with collaborative activities to reduce isolation
                </p>
              </div>

              {allTestsCompletionRate < 80 && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-1">Encourage Test Completion</h3>
                  <p className="text-sm text-muted-foreground">
                    Only {allTestsCompletionRate}% of employees have completed all assessments. Send reminders to get complete wellness insights.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">Mental Health Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Share information about employee assistance programs and wellness resources
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Burnout Risk Distribution */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Burnout Risk Distribution</h2>
          <div className="flex justify-between text-[10px] md:text-xl text-muted-foreground mb-4">
            <span>Level</span>
            <span>Number of Employees</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  <span className="font-medium">Low Risk (0-44)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.low}</span>
              </div>
              <Progress 
                value={stats.burnoutCompleted > 0 ? (stats.riskCategories.low / stats.burnoutCompleted) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-warning" />
                  <span className="font-medium">Moderate Risk (45-88)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.moderate}</span>
              </div>
              <Progress 
                value={stats.burnoutCompleted > 0 ? (stats.riskCategories.moderate / stats.burnoutCompleted) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  <span className="font-medium">High Risk (89-132)</span>
                </div>
                <span className="text-lg font-semibold">{stats.riskCategories.high}</span>
              </div>
              <Progress 
                value={stats.burnoutCompleted > 0 ? (stats.riskCategories.high / stats.burnoutCompleted) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
          
          {stats.burnoutCompleted === 0 && (
            <p className="text-center text-muted-foreground mt-6">
              No burnout test results yet. Encourage employees to complete the assessment.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
