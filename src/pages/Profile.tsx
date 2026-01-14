import { useState } from "react";
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
import { shareProfile } from "@/lib/profileShare";
import { toast } from "sonner";
import { triggerHaptic } from "@/hooks/use-haptics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Link } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { patientProfile, medications } = useOnboarding();
  const healthProfile = useHealthProfile();
  const { getProfileCompletionPercentage, profileCompleted } = healthProfile;
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const completionPercentage = getProfileCompletionPercentage();

  const profile = {
    name: patientProfile?.fullName || "Sarah Johnson",
    age: patientProfile?.dateOfBirth 
      ? Math.floor((Date.now() - new Date(patientProfile.dateOfBirth).getTime()) / 31557600000)
      : 45,
  };

  const medicationCount = medications.length > 0 ? medications.length : 3;

  const handleEdit = () => {
    triggerHaptic('light');
    navigate("/edit-profile");
  };

  const handleShare = () => {
    triggerHaptic('light');
    setShareDialogOpen(true);
  };

  const handleShareAs = async (method: 'pdf' | 'link') => {
    try {
      triggerHaptic('medium');
      await shareProfile(
        { patientProfile, healthProfile, medications },
        method
      );
      setShareDialogOpen(false);
      if (method === 'link') {
        toast.success("Profile link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share profile");
    }
  };

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
              avatarUrl={patientProfile?.avatarUrl}
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start gap-3 h-14"
              onClick={() => handleShareAs('pdf')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Export as PDF</p>
                <p className="text-xs text-muted-foreground">Download or print your profile</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-3 h-14"
              onClick={() => handleShareAs('link')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Link className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Copy Link</p>
                <p className="text-xs text-muted-foreground">Share a link to your profile</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
