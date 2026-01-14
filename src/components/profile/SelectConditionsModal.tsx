import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { conditions, conditionCategories, searchConditions, getConditionsByCategory, Condition } from '@/data/conditions';
import { cn } from '@/lib/utils';

interface SelectConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConditions: string[];
  otherText?: string;
  onSave: (conditions: string[], otherText?: string) => void;
}

export function SelectConditionsModal({
  open,
  onOpenChange,
  selectedConditions,
  otherText,
  onSave,
}: SelectConditionsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(selectedConditions);
  const [localOtherText, setLocalOtherText] = useState(otherText || '');

  // Reset local state when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalSelected(selectedConditions);
      setLocalOtherText(otherText || '');
      setSearchQuery('');
    }
  }, [open, selectedConditions, otherText]);

  const filteredConditions = useMemo(() => {
    if (searchQuery.trim()) {
      return searchConditions(searchQuery);
    }
    return conditions;
  }, [searchQuery]);

  // Group by category
  const groupedConditions = useMemo(() => {
    const groups: Record<string, Condition[]> = {};
    filteredConditions.forEach(c => {
      if (!groups[c.category]) {
        groups[c.category] = [];
      }
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredConditions]);

  const selectedConditionsList = useMemo(() => {
    return conditions.filter(c => localSelected.includes(c.id));
  }, [localSelected]);

  const toggleCondition = (conditionId: string) => {
    setLocalSelected(prev =>
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleSave = () => {
    const finalOtherText = localSelected.includes('other-condition') ? localOtherText : undefined;
    onSave(localSelected, finalOtherText);
    onOpenChange(false);
  };

  const ConditionRow = ({ condition, isSelected }: { condition: Condition; isSelected: boolean }) => (
    <motion.button
      onClick={() => toggleCondition(condition.id)}
      className={cn(
        "w-full flex items-center justify-between py-3 px-4 text-left transition-colors",
        "border-b border-border last:border-b-0",
        "hover:bg-muted/50 active:bg-muted"
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium text-foreground">{condition.name}</p>
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

  const showOtherTextInput = localSelected.includes('other-condition');

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
          <h2 className="text-lg font-semibold text-foreground">Select conditions</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conditions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="pb-32">
            {/* Currently Selected Section */}
            {selectedConditionsList.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Selected ({selectedConditionsList.length})
                  </p>
                </div>
                {selectedConditionsList.map((condition) => (
                  <ConditionRow key={condition.id} condition={condition} isSelected={true} />
                ))}
              </div>
            )}

            {/* Other condition text input */}
            {showOtherTextInput && (
              <div className="px-4 py-4 border-b border-border bg-muted/20">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Describe your condition
                </label>
                <Textarea
                  placeholder="Enter your condition..."
                  value={localOtherText}
                  onChange={(e) => setLocalOtherText(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Categories */}
            {conditionCategories.map((category) => {
              const categoryConditions = groupedConditions[category];
              if (!categoryConditions || categoryConditions.length === 0) return null;

              return (
                <div key={category}>
                  <div className="px-4 py-3 bg-muted/30 sticky top-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category}
                    </p>
                  </div>
                  {categoryConditions.map((condition) => (
                    <ConditionRow
                      key={condition.id}
                      condition={condition}
                      isSelected={localSelected.includes(condition.id)}
                    />
                  ))}
                </div>
              );
            })}

            {/* Empty State */}
            {filteredConditions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-muted-foreground text-center">
                  No conditions found matching "{searchQuery}"
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
            Save conditions {localSelected.length > 0 && `(${localSelected.length})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
