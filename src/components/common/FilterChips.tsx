import { cn } from "@/lib/utils";

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterChips<T extends string>({ options, selected, onSelect }: FilterChipsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selected === option.value
              ? "bg-gradient-primary text-primary-foreground shadow-button"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
