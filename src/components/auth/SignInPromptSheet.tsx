import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Shield, Cloud, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "@/hooks/use-haptics";

interface SignInPromptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const benefits = [
  { icon: Cloud, text: "Sync data across devices" },
  { icon: Shield, text: "Keep your data secure" },
  { icon: Bell, text: "Get dose reminders" },
];

export function SignInPromptSheet({ 
  open, 
  onOpenChange,
  title = "Create an account to save",
  description = "Sign up to save your medications and keep them synced across all your devices."
}: SignInPromptSheetProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    triggerHaptic('medium');
    onOpenChange(false);
    navigate("/auth", { state: { mode: "signup" } });
  };

  const handleSignIn = () => {
    triggerHaptic('light');
    onOpenChange(false);
    navigate("/auth", { state: { mode: "signin" } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-10">
        <SheetHeader className="text-left pt-2">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{benefit.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <motion.button
            onClick={handleSignUp}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="h-4 w-4" />
            Create account
          </motion.button>

          <motion.button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 font-semibold text-foreground"
            whileTap={{ scale: 0.98 }}
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </motion.button>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-sm text-muted-foreground py-2"
          >
            Continue exploring
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
