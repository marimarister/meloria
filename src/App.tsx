import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";
import BurnoutTest from "./pages/tests/BurnoutTest";
import ChannelPerceptionTest from "./pages/tests/ChannelPerceptionTest";
import PreferenceTest from "./pages/tests/PreferenceTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/test/burnout" element={<BurnoutTest />} />
          <Route path="/test/perception" element={<ChannelPerceptionTest />} />
          <Route path="/test/preference" element={<PreferenceTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
