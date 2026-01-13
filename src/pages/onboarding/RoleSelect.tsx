import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Users, Check } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useOnboarding, UserRole } from "@/contexts/OnboardingContext";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setUserRole } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/auth");
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    triggerHaptic('medium');
    setUserRole(selectedRole);
    
    if (selectedRole === "patient") {
      navigate("/onboarding/patient/profile");
    } else {
      navigate("/onboarding/caregiver/profile");
    }
  };

  const roles = [
    {
      id: "patient" as const,
      icon: User,
      title: "I'm a patient",
      body: "Track doses, case battery, refills, and exports.",
    },
    {
      id: "caregiver" as const,
      icon: Users,
      title: "I'm a caregiver",
      body: "View a patient's schedule and get alerts.",
    },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        <div />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-title-large text-foreground">
            How will you use TARVA?
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Choose one. You can change this later in Settings.
          </p>
        </motion.div>

        <div className="mt-8 space-y-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedRole(role.id);
                }}
                className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? "bg-gradient-primary" : "bg-accent"
                  }`}>
                    <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-primary"}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role.body}
                    </p>
                  </div>

                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-10 pt-4">
        <motion.button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="btn-primary w-full py-4 disabled:opacity-50"
          whileTap={{ scale: selectedRole ? 0.98 : 1 }}
        >
          Continue
        </motion.button>

        <button
          onClick={handleBack}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground"
        >
          Back
        </button>
      </div>
    </div>
  );
}
