import { Edit2, Share } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  age?: number;
  avatarUrl?: string;
  onEdit: () => void;
  onShare: () => void;
}

export function ProfileHeader({ name, age, avatarUrl, onEdit, onShare }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-primary p-0.5">
          <div className="h-full w-full overflow-hidden rounded-full bg-background">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent text-2xl font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
      <h2 className="mt-4 text-title text-foreground">{name}</h2>
      {age && <p className="text-caption">{age} years old</p>}
      <div className="mt-4 flex gap-3">
        <button onClick={onEdit} className="btn-primary">
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </button>
        <button onClick={onShare} className="btn-secondary">
          <Share className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
