import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { NavigationCard } from "@/components/common/NavigationCard";
import { Medication } from "@/components/home/MedicationCard";
import { Users, Settings, Plus, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockProfile = {
  name: "Sarah Johnson",
  age: 45,
  bloodType: "A+",
  height: "5'6\"",
  weight: "145 lbs",
  allergies: ["Penicillin", "Sulfa"],
};

const mockMedications: Medication[] = [
  { id: "1", name: "Lisinopril", strength: "10mg", scheduledTime: "8:00 AM", status: "pending" },
  { id: "2", name: "Metformin", strength: "500mg", scheduledTime: "9:00 AM", status: "pending" },
  { id: "3", name: "Atorvastatin", strength: "20mg", scheduledTime: "10:00 PM", status: "pending" },
];

export default function Profile() {
  const navigate = useNavigate();

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
              name={mockProfile.name}
              age={mockProfile.age}
              onEdit={handleEdit}
              onShare={handleShare}
            />
          </FadeIn>

          <FadeIn delay={0.15}>
            <ProfileInfoCard
              bloodType={mockProfile.bloodType}
              height={mockProfile.height}
              weight={mockProfile.weight}
              allergies={mockProfile.allergies}
            />
          </FadeIn>

          <section>
            <FadeIn delay={0.2}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-section text-foreground">My Medications</h2>
                <motion.button 
                  onClick={() => navigate("/add")} 
                  className="btn-ghost p-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-5 w-5 text-primary" />
                </motion.button>
              </div>
            </FadeIn>
            <StaggerContainer className="space-y-3">
              {mockMedications.map((med) => (
                <StaggerItem key={med.id}>
                  <motion.div 
                    className="card-tarva"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{med.name}</h4>
                        <p className="text-caption">{med.strength} • {med.scheduledTime}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <StaggerContainer className="space-y-3">
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
