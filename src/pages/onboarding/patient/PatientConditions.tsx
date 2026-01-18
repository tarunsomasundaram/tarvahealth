import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Heart, Plus, X, Check } from "lucide-react";
import { triggerHaptic } from "@/hooks/use-haptics";
import { useHealthProfile } from "@/contexts/HealthProfileContext";
import { conditions, conditionCategories } from "@/data/conditions";
import { cn } from "@/lib/utils";

// Main conditions to highlight
const mainConditions = [
  { id: 'epilepsy', name: 'Epilepsy', icon: '🧠' },
  { id: 'type-2-diabetes', name: 'Diabetes', icon: '💉' },
  { id: 'hypertension', name: 'Hypertension', icon: '❤️' },
  { id: 'heart-failure', name: 'Heart Condition', icon: '🫀' },
  { id: 'asthma', name: 'Asthma', icon: '🫁' },
  { id: 'depression', name: 'Depression', icon: '🧘' },
];

export default function PatientConditions() {
  const navigate = useNavigate();
  const { conditions: savedConditions, conditionOtherText, setConditions, setConditionOtherText } = useHealthProfile();
  
  const [selectedConditions, setSelectedConditions] = useState<string[]>(savedConditions || []);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customCondition, setCustomCondition] = useState(conditionOtherText || "");
  const [showCustomInput, setShowCustomInput] = useState(!!conditionOtherText);

  const handleBack = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/case");
  };

  const toggleCondition = (id: string) => {
    triggerHaptic('light');
    setSelectedConditions(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    triggerHaptic('medium');
    setConditions(selectedConditions);
    setConditionOtherText(customCondition);
    navigate("/onboarding/patient/medication");
  };

  const handleSkip = () => {
    triggerHaptic('light');
    navigate("/onboarding/patient/medication");
  };

  const filteredConditions = conditions.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.synonyms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedConditions = conditionCategories.reduce((acc, category) => {
    const items = filteredConditions.filter(c => c.category === category);
    if (items.length > 0) acc[category] = items;
    return acc;
  }, {} as Record<string, typeof conditions>);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </motion.button>
        
        {/* Progress indicator */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-primary shadow-lg mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-title-large text-foreground">
            What conditions do you have?
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            This helps us personalize your experience
          </p>
        </motion.div>

        {/* Main conditions grid */}
        {!showAllConditions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 mb-4"
          >
            {mainConditions.map((condition) => {
              const isSelected = selectedConditions.includes(condition.id);
              return (
                <motion.button
                  key={condition.id}
                  onClick={() => toggleCondition(condition.id)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-transparent bg-secondary"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl mb-2">{condition.icon}</span>
                  <span className="text-sm font-medium text-foreground">{condition.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Show more / Browse all */}
        {!showAllConditions && (
          <motion.button
            onClick={() => setShowAllConditions(true)}
            className="w-full py-3 text-sm font-medium text-primary mb-4"
            whileTap={{ scale: 0.98 }}
          >
            Browse all conditions
          </motion.button>
        )}

        {/* Full conditions list */}
        {showAllConditions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-tarva pl-12"
              />
            </div>

            {Object.entries(groupedConditions).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((condition) => {
                    const isSelected = selectedConditions.includes(condition.id);
                    return (
                      <motion.button
                        key={condition.id}
                        onClick={() => toggleCondition(condition.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                          isSelected ? "bg-primary/10" : "bg-secondary/50"
                        )}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-sm text-foreground">{condition.name}</span>
                        <div className={cn(
                          "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAllConditions(false)}
              className="w-full py-3 text-sm font-medium text-muted-foreground"
            >
              Show less
            </button>
          </motion.div>
        )}

        {/* Add custom condition */}
        <div className="mt-4">
          {!showCustomInput ? (
            <motion.button
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-2 text-sm font-medium text-primary"
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              Add other condition
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-foreground">Other condition</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your condition..."
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  className="input-tarva pr-10"
                />
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCondition("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Selected conditions summary */}
        {(selectedConditions.length > 0 || customCondition) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <p className="text-sm font-medium text-foreground mb-2">Selected conditions:</p>
            <div className="flex flex-wrap gap-2">
              {selectedConditions.map(id => {
                const condition = conditions.find(c => c.id === id) || 
                  mainConditions.find(c => c.id === id);
                return condition ? (
                  <span key={id} className="badge-pill text-xs">
                    {condition.name}
                  </span>
                ) : null;
              })}
              {customCondition && (
                <span className="badge-pill text-xs">{customCondition}</span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <motion.button
          onClick={handleContinue}
          className="btn-primary w-full mb-3"
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
        <button
          onClick={handleSkip}
          className="w-full text-center text-sm font-medium text-muted-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
