import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/hooks/use-haptics";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string;
  name: string;
  onAvatarChange: (avatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({ currentAvatar, name, onAvatarChange, size = "lg" }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-24 w-24",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const cameraSize = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
    lg: "h-8 w-8",
  };

  const handleClick = () => {
    triggerHaptic('light');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    triggerHaptic('medium');

    try {
      // Convert to base64 for local storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Resize image to reduce storage size
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 400;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          onAvatarChange(resizedBase64);
          setIsUploading(false);
          toast.success("Photo updated");
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload photo");
      setIsUploading(false);
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <motion.button
        onClick={handleClick}
        className={`${sizeClasses[size]} overflow-hidden rounded-full bg-gradient-primary p-0.5 relative`}
        whileTap={{ scale: 0.95 }}
        disabled={isUploading}
      >
        <div className="h-full w-full overflow-hidden rounded-full bg-background">
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt={name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent">
              {name ? (
                <span className="text-2xl font-bold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className={`${iconSizes[size]} text-muted-foreground`} />
              )}
            </div>
          )}
        </div>
        
        {/* Camera overlay */}
        <div className={`absolute bottom-0 right-0 ${cameraSize[size]} flex items-center justify-center rounded-full bg-primary shadow-lg`}>
          {isUploading ? (
            <motion.div
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
