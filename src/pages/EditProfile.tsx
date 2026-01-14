import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn } from "@/components/animations";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useHealthProfile } from "@/contexts/HealthProfileContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { triggerHaptic } from "@/hooks/use-haptics";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

export default function EditProfile() {
  const navigate = useNavigate();
  const { patientProfile, setPatientProfile } = useOnboarding();
  const { age, heightValue, heightUnit, bloodGroup, setAge, setHeightValue, setBloodGroup } = useHealthProfile();
  
  const [fullName, setFullName] = useState(patientProfile?.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(patientProfile?.dateOfBirth || "");
  const [allergies, setAllergies] = useState(patientProfile?.allergies || "");
  const [profileAge, setProfileAge] = useState(age?.toString() || "");
  const [height, setHeight] = useState(heightValue?.toString() || "");
  const [blood, setBlood] = useState(bloodGroup || "");
  const [avatarUrl, setAvatarUrl] = useState(patientProfile?.avatarUrl || "");

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/profile");
  };

  const handleSave = () => {
    triggerHaptic('medium');
    
    // Update patient profile
    setPatientProfile({
      ...patientProfile,
      fullName: fullName || patientProfile?.fullName || "User",
      timezone: patientProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateOfBirth,
      allergies,
      avatarUrl,
    });

    // Update health profile
    if (profileAge) setAge(parseInt(profileAge));
    if (height) setHeightValue(parseFloat(height));
    if (blood) setBlood(blood);

    toast.success("Profile updated successfully");
    navigate("/profile");
  };

  const isFormValid = fullName.trim().length > 0;

  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <motion.button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <h1 className="text-xl font-semibold text-foreground">Edit Profile</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <FadeIn delay={0.1}>
            <div className="space-y-6 mt-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <AvatarUpload
                  currentAvatar={avatarUrl}
                  name={fullName}
                  onAvatarChange={setAvatarUrl}
                  size="lg"
                />
                <p className="mt-2 text-sm text-muted-foreground">Tap to change photo</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileAge}
                  onChange={(e) => setProfileAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height ({heightUnit})</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={`Enter height in ${heightUnit}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  value={blood}
                  onChange={(e) => setBlood(e.target.value)}
                  placeholder="e.g., A+, B-, O+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="List any allergies (optional)"
                />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleSave}
              disabled={!isFormValid}
              className="w-full"
              size="lg"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
