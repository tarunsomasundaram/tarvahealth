import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { NavigationCard } from "@/components/common/NavigationCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Users, Settings, Pill, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const { patientProfile, medications } = useOnboarding();

  // Use profile data from context or defaults
  const profile = {
    name: patientProfile?.fullName || "Sarah Johnson",
    age: patientProfile?.dateOfBirth 
      ? Math.floor((Date.now() - new Date(patientProfile.dateOfBirth).getTime()) / 31557600000)
      : 45,
    bloodType: patientProfile?.bloodType || "A+",
    height: patientProfile?.height || "5'6\"",
    weight: patientProfile?.weight || "145 lbs",
    allergies: patientProfile?.allergies 
      ? patientProfile.allergies.split(',').map(a => a.trim())
      : ["Penicillin", "Sulfa"],
  };

  const medicationCount = medications.length > 0 ? medications.length : 3;

  const handleEdit = () => {
    console.log("Edit profile");
  };

  const handleShare = () => {
    console.log("Share profile");
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Profile" />

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
            <ProfileInfoCard
              bloodType={profile.bloodType}
              height={profile.height}
              weight={profile.weight}
              allergies={profile.allergies}
            />
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
