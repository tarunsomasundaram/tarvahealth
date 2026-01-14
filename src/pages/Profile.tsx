import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { HealthProfileCard } from "@/components/profile/HealthProfileCard";
import { NavigationCard } from "@/components/common/NavigationCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useHealthProfile } from "@/contexts/HealthProfileContext";
import { Users, Settings, Pill, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const { patientProfile, medications } = useOnboarding();
  const { getProfileCompletionPercentage, profileCompleted } = useHealthProfile();
  
  const completionPercentage = getProfileCompletionPercentage();

  const profile = {
    name: patientProfile?.fullName || "Sarah Johnson",
    age: patientProfile?.dateOfBirth 
      ? Math.floor((Date.now() - new Date(patientProfile.dateOfBirth).getTime()) / 31557600000)
      : 45,
  };

  const medicationCount = medications.length > 0 ? medications.length : 3;

  const handleEdit = () => console.log("Edit profile");
  const handleShare = () => console.log("Share profile");

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader 
          title="Profile" 
          rightContent={
            !profileCompleted && completionPercentage < 100 ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-medium text-primary">{completionPercentage}%</span>
              </div>
            ) : null
          }
        />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <ProfileHeader
              name={profile.name}
              age={profile.age}
              onEdit={handleEdit}
              onShare={handleShare}
            />
          </FadeIn>

          <FadeIn delay={0.15}>
            <HealthProfileCard />
          </FadeIn>

          <StaggerContainer className="space-y-3">
            <StaggerItem>
              <motion.button
                onClick={() => navigate("/my-medications")}
                className="card-tarva-interactive w-full text-left"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">My Medications</h4>
                    <p className="text-caption">{medicationCount} active medication{medicationCount !== 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </motion.button>
            </StaggerItem>

            <StaggerItem>
              <NavigationCard
                title="Caregivers"
                subtitle="Manage who can view your data"
                icon={<Users className="h-5 w-5 text-primary" />}
                to="/caregivers"
              />
            </StaggerItem>

            <StaggerItem>
              <NavigationCard
                title="Settings"
                subtitle="Notifications, privacy, appearance"
                icon={<Settings className="h-5 w-5 text-primary" />}
                to="/settings"
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </AnimatedPage>
  );
}
