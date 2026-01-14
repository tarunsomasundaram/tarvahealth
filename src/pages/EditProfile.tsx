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
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { patientProfile, setPatientProfile } = useOnboarding();
  const { 
    age, 
    heightValue, 
    heightUnit, 
    weightValue,
    weightUnit,
    bloodGroup, 
    setAge, 
    setHeightValue,
    setHeightUnit,
    setWeightValue,
    setWeightUnit,
    setBloodGroup,
    getProfileCompletionPercentage 
  } = useHealthProfile();
  
  const [fullName, setFullName] = useState(patientProfile?.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(patientProfile?.dateOfBirth || "");
  const [allergies, setAllergies] = useState(patientProfile?.allergies || "");
  const [profileAge, setProfileAge] = useState(age?.toString() || "");
  const [height, setHeight] = useState(heightValue?.toString() || "");
  const [localHeightUnit, setLocalHeightUnit] = useState(heightUnit);
  const [weight, setWeight] = useState(weightValue?.toString() || "");
  const [localWeightUnit, setLocalWeightUnit] = useState(weightUnit);
  const [blood, setBlood] = useState(bloodGroup || "");
  const [avatarUrl, setAvatarUrl] = useState(patientProfile?.avatarUrl || "");

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/profile");
  };

  const handleSave = () => {
    triggerHaptic('medium');
    
    // Update patient profile (allow partial saves)
    setPatientProfile({
      ...patientProfile,
      fullName: fullName || patientProfile?.fullName || "User",
      timezone: patientProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateOfBirth,
      allergies,
      avatarUrl,
    });

    // Update health profile fields (each field updates independently)
    if (profileAge) {
      setAge(parseInt(profileAge));
    }
    if (height) {
      setHeightValue(parseFloat(height));
    }
    setHeightUnit(localHeightUnit);
    if (weight) {
      setWeightValue(parseFloat(weight));
    }
    setWeightUnit(localWeightUnit);
    if (blood) {
      setBloodGroup(blood);
    }

    const completionAfterSave = getProfileCompletionPercentage();
    toast.success(`Profile saved! ${completionAfterSave}% complete`);
    navigate("/profile");
  };

  // Calculate fields completed for preview
  const fieldsCompleted = [
    profileAge ? 1 : 0,
    height ? 1 : 0,
    weight ? 1 : 0,
    blood ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <h1 className="text-xl font-semibold text-foreground">Edit Profile</h1>
          </div>
          <motion.button
            onClick={handleSave}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <Save className="h-4 w-4" />
            Save
          </motion.button>
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

              {/* Progress hint */}
              <div className="bg-accent/50 rounded-xl p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Complete your profile to help us personalize your experience
                </p>
                <p className="text-xs text-primary mt-1">
                  {fieldsCompleted}/4 health fields filled • Save anytime
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
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
                <Label htmlFor="height">Height</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={`Enter height`}
                    className="flex-1"
                  />
                  <div className="flex rounded-lg border border-input overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setLocalHeightUnit('cm')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        localHeightUnit === 'cm' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalHeightUnit('in')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        localHeightUnit === 'in' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      in
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Enter weight`}
                    className="flex-1"
                  />
                  <div className="flex rounded-lg border border-input overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setLocalWeightUnit('kg')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        localWeightUnit === 'kg' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalWeightUnit('lbs')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        localWeightUnit === 'lbs' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={blood} onValueChange={setBlood}>
                  <SelectTrigger id="bloodGroup" className="w-full">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
