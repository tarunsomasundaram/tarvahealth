import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  RefreshCw, 
  BarChart3, 
  Battery,
  Trash2,
  Mail,
  Clock,
  Check
} from "lucide-react";
import { Caregiver, CaregiverPermissions, useCaregiver } from "@/contexts/CaregiverContext";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/use-haptics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditCaregiverSheetProps {
  caregiver: Caregiver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const permissionItems: { 
  key: keyof CaregiverPermissions; 
  label: string; 
  description: string;
  icon: React.ElementType;
}[] = [
  { 
    key: "calendar", 
    label: "View Calendar", 
    description: "See medication schedule and history",
    icon: Calendar 
  },
  { 
    key: "stats", 
    label: "View Stats", 
    description: "Access adherence and on-time statistics",
    icon: BarChart3 
  },
  { 
    key: "missedAlerts", 
    label: "Missed Dose Alerts", 
    description: "Get notified when doses are missed",
    icon: AlertTriangle 
  },
  { 
    key: "refillAlerts", 
    label: "Refill Alerts", 
    description: "Get notified when medication is running low",
    icon: RefreshCw 
  },
  { 
    key: "lowBattery", 
    label: "Low Battery Alerts", 
    description: "Get notified when case battery is low",
    icon: Battery 
  },
  { 
    key: "doseTaken", 
    label: "Dose Taken Notifications", 
    description: "Get notified when doses are taken",
    icon: Check 
  },
];

export function EditCaregiverSheet({ caregiver, open, onOpenChange }: EditCaregiverSheetProps) {
  const { updatePermissions, removeCaregiver } = useCaregiver();
  const { toast } = useToast();
  const { trigger } = useHaptics();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!caregiver) return null;

  const handleTogglePermission = (key: keyof CaregiverPermissions) => {
    trigger('light');
    updatePermissions(caregiver.id, { [key]: !caregiver.permissions[key] });
    toast({
      title: "Permission updated",
      description: `${key} ${caregiver.permissions[key] ? 'disabled' : 'enabled'} for ${caregiver.name}`,
    });
  };

  const handleRemoveCaregiver = () => {
    trigger('medium');
    removeCaregiver(caregiver.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
    toast({
      title: "Caregiver removed",
      description: `${caregiver.name} no longer has access to your data`,
      variant: "destructive",
    });
  };

  const enabledCount = Object.values(caregiver.permissions).filter(Boolean).length;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-[28px] max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-center pb-4">
            <SheetTitle>Edit Caregiver Access</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-8">
            {/* Caregiver info */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{caregiver.name}</h3>
                <p className="text-sm text-muted-foreground">{caregiver.relationship}</p>
                {caregiver.email && (
                  <div className="flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{caregiver.email}</span>
                  </div>
                )}
              </div>
              <div className={`badge-status ${
                caregiver.accessLevel === "full" 
                  ? "bg-success/15 text-success" 
                  : "bg-accent text-accent-foreground"
              }`}>
                {enabledCount}/{permissionItems.length}
              </div>
            </div>

            {/* Linked info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Linked {format(caregiver.linkedAt, "MMM d, yyyy")}</span>
              {caregiver.lastActive && (
                <>
                  <span>•</span>
                  <span>Active {caregiver.lastActive}</span>
                </>
              )}
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Data & Notifications</h4>
              {permissionItems.map((item) => {
                const Icon = item.icon;
                const isEnabled = caregiver.permissions[item.key];
                
                return (
                  <motion.div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isEnabled ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleTogglePermission(item.key)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Remove caregiver */}
            <motion.button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive font-medium"
              whileTap={{ scale: 0.97 }}
            >
              <Trash2 className="h-5 w-5" />
              Remove Caregiver
            </motion.button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Caregiver?</AlertDialogTitle>
            <AlertDialogDescription>
              {caregiver.name} will no longer have access to your medication data and won't receive any notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveCaregiver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
