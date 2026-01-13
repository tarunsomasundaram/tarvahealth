import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

// Main app pages
import Home from "./pages/Home";
import Case from "./pages/Case";
import AddMedication from "./pages/AddMedication";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Caregivers from "./pages/Caregivers";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import MyMedications from "./pages/MyMedications";
import NotFound from "./pages/NotFound";

// Onboarding pages
import Splash from "./pages/onboarding/Splash";
import Welcome from "./pages/onboarding/Welcome";
import Auth from "./pages/onboarding/Auth";
import RoleSelect from "./pages/onboarding/RoleSelect";
import PatientProfile from "./pages/onboarding/patient/PatientProfile";
import PatientPasscode from "./pages/onboarding/patient/PatientPasscode";
import PatientNotifications from "./pages/onboarding/patient/PatientNotifications";
import PatientCase from "./pages/onboarding/patient/PatientCase";
import PatientMedication from "./pages/onboarding/patient/PatientMedication";
import PatientCaregiver from "./pages/onboarding/patient/PatientCaregiver";
import CaregiverProfile from "./pages/onboarding/caregiver/CaregiverProfile";
import CaregiverPasscode from "./pages/onboarding/caregiver/CaregiverPasscode";
import CaregiverNotifications from "./pages/onboarding/caregiver/CaregiverNotifications";
import CaregiverLink from "./pages/onboarding/caregiver/CaregiverLink";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

const queryClient = new QueryClient();

function AppRoutes() {
  const { hasCompletedOnboarding } = useOnboarding();

  if (!hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/onboarding/patient/profile" element={<PatientProfile />} />
        <Route path="/onboarding/patient/passcode" element={<PatientPasscode />} />
        <Route path="/onboarding/patient/notifications" element={<PatientNotifications />} />
        <Route path="/onboarding/patient/case" element={<PatientCase />} />
        <Route path="/onboarding/patient/medication" element={<PatientMedication />} />
        <Route path="/onboarding/patient/caregiver" element={<PatientCaregiver />} />
        <Route path="/onboarding/caregiver/profile" element={<CaregiverProfile />} />
        <Route path="/onboarding/caregiver/passcode" element={<CaregiverPasscode />} />
        <Route path="/onboarding/caregiver/notifications" element={<CaregiverNotifications />} />
        <Route path="/onboarding/caregiver/link" element={<CaregiverLink />} />
        <Route path="/onboarding/complete" element={<OnboardingComplete />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/case" element={<Case />} />
        <Route path="/add" element={<AddMedication />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/caregivers" element={<Caregivers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/my-medications" element={<MyMedications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomTabBar />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <OnboardingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="mx-auto max-w-md min-h-screen bg-background">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </OnboardingProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
