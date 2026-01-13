import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { NavigationCard } from "@/components/common/NavigationCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Users, Settings, Bell, Shield } from "lucide-react";

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const { caregiverProfile } = useOnboarding();

  return (
    <AnimatedPage>
      <div className="page-padding pb-24">
        <PageHeader title="Profile" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <ProfileHeader
              name={caregiverProfile?.fullName || "Caregiver"}
              onEdit={() => navigate("/caregiver/edit-profile")}
              onShare={() => {}}
            />
          </FadeIn>

          <section>
            <FadeIn delay={0.2}>
              <h2 className="text-section text-foreground mb-3">Manage</h2>
            </FadeIn>
            <StaggerContainer className="space-y-3">
              <StaggerItem>
                <NavigationCard
                  icon={<Users className="h-5 w-5 text-primary" />}
                  title="Linked Patients"
                  subtitle="1 patient"
                  to="/caregiver/patients"
                />
              </StaggerItem>
              <StaggerItem>
                <NavigationCard
                  icon={<Bell className="h-5 w-5 text-primary" />}
                  title="Notifications"
                  subtitle="Manage alert preferences"
                  to="/notifications"
                />
              </StaggerItem>
              <StaggerItem>
                <NavigationCard
                  icon={<Shield className="h-5 w-5 text-primary" />}
                  title="Security"
                  subtitle="PIN & Face ID"
                  to="/settings"
                />
              </StaggerItem>
              <StaggerItem>
                <NavigationCard
                  icon={<Settings className="h-5 w-5 text-primary" />}
                  title="Settings"
                  subtitle="App preferences"
                  to="/settings"
                />
              </StaggerItem>
            </StaggerContainer>
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
