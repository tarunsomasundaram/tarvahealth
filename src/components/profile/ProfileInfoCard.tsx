import { Droplets, Ruler, Scale, AlertCircle } from "lucide-react";

interface ProfileInfoCardProps {
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string[];
}

export function ProfileInfoCard({ bloodType, height, weight, allergies }: ProfileInfoCardProps) {
  return (
    <div className="card-tarva">
      <h3 className="text-section text-foreground mb-4">Health Info</h3>
      <div className="grid grid-cols-3 gap-4">
        {bloodType && (
          <div className="flex flex-col items-center rounded-xl bg-accent p-3">
            <Droplets className="h-5 w-5 text-primary" />
            <span className="mt-1 text-xs text-muted-foreground">Blood</span>
            <span className="font-semibold text-foreground">{bloodType}</span>
          </div>
        )}
        {height && (
          <div className="flex flex-col items-center rounded-xl bg-accent p-3">
            <Ruler className="h-5 w-5 text-primary" />
            <span className="mt-1 text-xs text-muted-foreground">Height</span>
            <span className="font-semibold text-foreground">{height}</span>
          </div>
        )}
        {weight && (
          <div className="flex flex-col items-center rounded-xl bg-accent p-3">
            <Scale className="h-5 w-5 text-primary" />
            <span className="mt-1 text-xs text-muted-foreground">Weight</span>
            <span className="font-semibold text-foreground">{weight}</span>
          </div>
        )}
      </div>
      {allergies && allergies.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Allergies
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <span key={allergy} className="badge-pill bg-destructive/10 text-destructive">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
