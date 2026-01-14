import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { behaviorCategories, behaviors, getBehaviorsByCategory, searchBehaviors, Behavior } from '@/data/behaviors';
import { cn } from '@/lib/utils';

interface SelectBehaviorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBehaviors: string[];
  onSave: (behaviors: string[]) => void;
}

export function SelectBehaviorsModal({
  open,
  onOpenChange,
  selectedBehaviors,
  onSave,
}: SelectBehaviorsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(behaviorCategories[0].id);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedBehaviors);

  // Reset local state when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalSelected(selectedBehaviors);
      setSearchQuery('');
      setActiveTab(behaviorCategories[0].id);
    }
  }, [open, selectedBehaviors]);

  const filteredBehaviors = useMemo(() => {
    if (searchQuery.trim()) {
      return searchBehaviors(searchQuery, activeTab);
    }
    return getBehaviorsByCategory(activeTab);
  }, [searchQuery, activeTab]);

  const selectedInCategory = useMemo(() => {
    return filteredBehaviors.filter(b => localSelected.includes(b.id));
  }, [filteredBehaviors, localSelected]);

  const notSelectedInCategory = useMemo(() => {
    return filteredBehaviors.filter(b => !localSelected.includes(b.id));
  }, [filteredBehaviors, localSelected]);

  const toggleBehavior = (behaviorId: string) => {
    setLocalSelected(prev => 
      prev.includes(behaviorId)
        ? prev.filter(id => id !== behaviorId)
        : [...prev, behaviorId]
    );
  };

  const handleSave = () => {
    onSave(localSelected);
    onOpenChange(false);
  };

  const BehaviorRow = ({ behavior, isSelected }: { behavior: Behavior; isSelected: boolean }) => (
    <motion.button
      onClick={() => toggleBehavior(behavior.id)}
      className={cn(
        "w-full flex items-center justify-between py-4 px-4 text-left transition-colors",
        "border-b border-border last:border-b-0",
        "hover:bg-muted/50 active:bg-muted"
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium text-foreground">{behavior.name}</p>
        <p className="text-sm text-muted-foreground truncate">{behavior.prompt}</p>
      </div>
      <div
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
          isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 bg-transparent"
        )}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-[20px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">Select behaviors</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for behaviors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex px-4 min-w-max">
            {behaviorCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={cn(
                  "px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                  activeTab === category.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category.name.toUpperCase()}
                {activeTab === category.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="pb-24">
            {/* Currently Selected Section */}
            {selectedInCategory.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Currently selected
                  </p>
                </div>
                {selectedInCategory.map((behavior) => (
                  <BehaviorRow key={behavior.id} behavior={behavior} isSelected={true} />
                ))}
              </div>
            )}

            {/* Not Selected Section */}
            {notSelectedInCategory.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Not selected
                  </p>
                </div>
                {notSelectedInCategory.map((behavior) => (
                  <BehaviorRow key={behavior.id} behavior={behavior} isSelected={false} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredBehaviors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-muted-foreground text-center">
                  No behaviors found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            onClick={handleSave}
            className="w-full btn-primary"
            size="lg"
          >
            Save behaviors {localSelected.length > 0 && `(${localSelected.length})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
