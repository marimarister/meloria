import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import BurnoutTest from "./pages/tests/BurnoutTest";
import ChannelPerceptionTest from "./pages/tests/ChannelPerceptionTest";
import PreferenceTest from "./pages/tests/PreferenceTest";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import MeloriaDashboard from "./pages/MeloriaDashboard";
import Questionnaires from "./pages/meloria-admin/Questionnaires";
import CompanyGroups from "./pages/meloria-admin/CompanyGroups";
import CompanyGroupDetail from "./pages/meloria-admin/CompanyGroupDetail";
import CreateCompanyGroup from "./pages/meloria-admin/CreateCompanyGroup";
import Accounts from "./pages/meloria-admin/Accounts";
import PremiumPlans from "./pages/meloria-admin/PremiumPlans";
import MeloriaSettings from "./pages/meloria-admin/MeloriaSettings";
import EditQuestionnaire from "./pages/meloria-admin/EditQuestionnaire";
import ViewDashboard from "./pages/meloria-admin/ViewDashboard";
import EditPremiumPlan from "./pages/meloria-admin/EditPremiumPlan";
import OurStory from "./pages/OurStory";
import Catalog from "./pages/Catalog";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/test/burnout" element={<BurnoutTest />} />
          <Route path="/test/perception" element={<ChannelPerceptionTest />} />
          <Route path="/test/preference" element={<PreferenceTest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/meloria-admin" element={<MeloriaDashboard />}>
            <Route path="questionnaires" element={<Questionnaires />} />
            <Route path="questionnaires/:type" element={<EditQuestionnaire />} />
            <Route path="company-groups" element={<CompanyGroups />} />
            <Route path="company-groups/create" element={<CreateCompanyGroup />} />
            <Route path="company-groups/:id" element={<CompanyGroupDetail />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="view-dashboard/:memberId/:dashboardType" element={<ViewDashboard />} />
            <Route path="premium-plans" element={<PremiumPlans />} />
            <Route path="premium-plans/:planType" element={<EditPremiumPlan />} />
            <Route path="settings" element={<MeloriaSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
