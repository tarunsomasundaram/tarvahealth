import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { triggerHaptic } from "@/hooks/use-haptics";

interface TakenElsewhereOptionProps {
  onTakenElsewhere: () => void;
  children: React.ReactNode;
}

export function TakenElsewhereOption({ 
  onTakenElsewhere, 
  children 
}: TakenElsewhereOptionProps) {
  const handleTakenElsewhere = () => {
    triggerHaptic('light');
    onTakenElsewhere();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-popover border border-border rounded-xl shadow-lg z-50"
      >
        <DropdownMenuItem 
          onClick={handleTakenElsewhere}
          className="flex items-center gap-2 cursor-pointer"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Taken elsewhere</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
