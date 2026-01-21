import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/hooks/use-auth";
import { DataProvider } from "@/contexts/DataContext";
import { FloatingBottomNav } from "@/components/layout/FloatingBottomNav";
import { CaregiverTabBar } from "@/components/layout/CaregiverTabBar";
// Main app pages
import Home from "./pages/Home";
import Case from "./pages/Case";
import AddMedication from "./pages/AddMedication";
import Stats from "./pages/Stats";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Caregivers from "./pages/Caregivers";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import MyMedications from "./pages/MyMedications";
import EditMedication from "./pages/EditMedication";
import ReminderPreferences from "./pages/ReminderPreferences";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

// Caregiver pages
import CaregiverHome from "./pages/caregiver/CaregiverHome";
import CaregiverStats from "./pages/caregiver/CaregiverStats";
import CaregiverCalendar from "./pages/caregiver/CaregiverCalendar";
import CaregiverProfilePage from "./pages/caregiver/CaregiverProfile";

// Onboarding pages
import Splash from "./pages/onboarding/Splash";
import Welcome from "./pages/onboarding/Welcome";
import Auth from "./pages/onboarding/Auth";
import RoleSelect from "./pages/onboarding/RoleSelect";
import PatientProfile from "./pages/onboarding/patient/PatientProfile";
import PatientPasscode from "./pages/onboarding/patient/PatientPasscode";
import PatientNotifications from "./pages/onboarding/patient/PatientNotifications";
import PatientCase from "./pages/onboarding/patient/PatientCase";
import PatientConditions from "./pages/onboarding/patient/PatientConditions";
import PatientMedication from "./pages/onboarding/patient/PatientMedication";
import PatientCaregiver from "./pages/onboarding/patient/PatientCaregiver";
import CaregiverOnboardingProfile from "./pages/onboarding/caregiver/CaregiverProfile";
import CaregiverPasscode from "./pages/onboarding/caregiver/CaregiverPasscode";
import CaregiverNotifications from "./pages/onboarding/caregiver/CaregiverNotifications";
import CaregiverLink from "./pages/onboarding/caregiver/CaregiverLink";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

const queryClient = new QueryClient();

function AppRoutes() {
  const { hasCompletedOnboarding, userRole } = useOnboarding();

  if (!hasCompletedOnboarding) {
    return (
      <div className="app-gradient-bg">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/onboarding/patient/profile" element={<PatientProfile />} />
          <Route path="/onboarding/patient/passcode" element={<PatientPasscode />} />
          <Route path="/onboarding/patient/notifications" element={<PatientNotifications />} />
          <Route path="/onboarding/patient/case" element={<PatientCase />} />
          <Route path="/onboarding/patient/conditions" element={<PatientConditions />} />
          <Route path="/onboarding/patient/medication" element={<PatientMedication />} />
          <Route path="/add" element={<AddMedication />} />
          <Route path="/onboarding/patient/caregiver" element={<PatientCaregiver />} />
          <Route path="/onboarding/caregiver/profile" element={<CaregiverOnboardingProfile />} />
          <Route path="/onboarding/caregiver/passcode" element={<CaregiverPasscode />} />
          <Route path="/onboarding/caregiver/notifications" element={<CaregiverNotifications />} />
          <Route path="/onboarding/caregiver/link" element={<CaregiverLink />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Caregiver dashboard routes
  if (userRole === 'caregiver') {
    return (
      <div className="app-gradient-bg">
        <Routes>
          <Route path="/" element={<Navigate to="/caregiver" replace />} />
          <Route path="/caregiver" element={<CaregiverHome />} />
          <Route path="/caregiver/stats" element={<CaregiverStats />} />
          <Route path="/caregiver/calendar" element={<CaregiverCalendar />} />
          <Route path="/caregiver/profile" element={<CaregiverProfilePage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CaregiverTabBar />
      </div>
    );
  }

  // Patient dashboard routes (default)
  return (
    <div className="app-gradient-bg">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/case" element={<Case />} />
        <Route path="/add" element={<AddMedication />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/caregivers" element={<Caregivers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/medications" element={<MyMedications />} />
        <Route path="/medications/:id/edit" element={<EditMedication />} />
        <Route path="/reminder-preferences" element={<ReminderPreferences />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingBottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <OnboardingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="mx-auto max-w-md min-h-screen app-gradient-bg">
                  <AppRoutes />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </OnboardingProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
