import { ReactNode } from "react";
import { Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  showCalendar?: boolean;
  rightContent?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showNotification = false,
  showCalendar = false,
  rightContent,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-start justify-between pb-4">
      <div>
        <h1 className="text-title-large text-foreground">{title}</h1>
        {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {showCalendar && (
          <button
            onClick={() => navigate("/calendar")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            aria-label="Calendar"
          >
            <Calendar className="h-5 w-5 text-foreground" />
          </button>
        )}
        {showNotification && (
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        )}
        {rightContent}
      </div>
    </header>
  );
}
