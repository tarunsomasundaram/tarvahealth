import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Activity, Droplets, Ruler, Calendar, AlertCircle, Sparkles, Scale } from 'lucide-react';
import { useHealthProfile } from '@/contexts/HealthProfileContext';
import { conditions } from '@/data/conditions';
import { behaviors } from '@/data/behaviors';
import { SelectBehaviorsModal } from './SelectBehaviorsModal';
import { SelectConditionsModal } from './SelectConditionsModal';
import { cn } from '@/lib/utils';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function HealthProfileCard() {
  const {
    age,
    heightValue,
    heightUnit,
    weightValue,
    weightUnit,
    bloodGroup,
    conditions: selectedConditionIds,
    conditionOtherText,
    selectedBehaviors,
    setAge,
    setHeightValue,
    setHeightUnit,
    setWeightValue,
    setWeightUnit,
    setBloodGroup,
    setConditions,
    setConditionOtherText,
    setSelectedBehaviors,
    getProfileCompletionPercentage,
  } = useHealthProfile();

  const [showBehaviorsModal, setShowBehaviorsModal] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const completionPercentage = getProfileCompletionPercentage();

  const selectedConditionNames = selectedConditionIds
    .map(id => conditions.find(c => c.id === id)?.name)
    .filter(Boolean);

  const selectedBehaviorNames = selectedBehaviors
    .slice(0, 3)
    .map(id => behaviors.find(b => b.id === id)?.name)
    .filter(Boolean);

  const formatHeight = () => {
    if (!heightValue) return null;
    if (heightUnit === 'cm') return `${heightValue} cm`;
    const feet = Math.floor(heightValue / 12);
    const inches = heightValue % 12;
    return `${feet}'${inches}"`;
  };

  const formatWeight = () => {
    if (!weightValue) return null;
    return `${weightValue} ${weightUnit}`;
  };

  return (
    <>
      <div className="card-tarva">
        {/* Header with completion */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="text-section text-foreground">Health Profile</h3>
          </div>
          {completionPercentage < 100 && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {completionPercentage}% complete
            </span>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Age */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex flex-col items-center rounded-xl bg-primary/10 p-2.5 hover:bg-primary/15 transition-colors"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="mt-1 text-[10px] text-muted-foreground">Age</span>
            <span className="font-semibold text-primary text-sm">{age || '—'}</span>
          </button>

          {/* Height */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex flex-col items-center rounded-xl bg-success/10 p-2.5 hover:bg-success/15 transition-colors"
          >
            <Ruler className="h-4 w-4 text-success" />
            <span className="mt-1 text-[10px] text-muted-foreground">Height</span>
            <span className="font-semibold text-success text-sm">{formatHeight() || '—'}</span>
          </button>

          {/* Weight */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex flex-col items-center rounded-xl bg-warning/10 p-2.5 hover:bg-warning/15 transition-colors"
          >
            <Scale className="h-4 w-4 text-warning" />
            <span className="mt-1 text-[10px] text-muted-foreground">Weight</span>
            <span className="font-semibold text-warning text-sm">{formatWeight() || '—'}</span>
          </button>

          {/* Blood Group */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex flex-col items-center rounded-xl bg-destructive/10 p-2.5 hover:bg-destructive/15 transition-colors"
          >
            <Droplets className="h-4 w-4 text-destructive" />
            <span className="mt-1 text-[10px] text-muted-foreground">Blood</span>
            <span className="font-semibold text-destructive text-sm">{bloodGroup || '—'}</span>
          </button>
        </div>

        {/* Conditions */}
        <motion.button
          onClick={() => setShowConditionsModal(true)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 mb-3 hover:bg-muted transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">Medical Conditions</p>
              {selectedConditionNames.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedConditionNames.slice(0, 2).join(', ')}
                  {selectedConditionNames.length > 2 && ` +${selectedConditionNames.length - 2} more`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Tap to add conditions</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.button>

        {/* Behaviors */}
        <motion.button
          onClick={() => setShowBehaviorsModal(true)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">Select Behaviors</p>
              {selectedBehaviorNames.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedBehaviorNames.join(', ')}
                  {selectedBehaviors.length > 3 && ` +${selectedBehaviors.length - 3} more`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Track lifestyle & symptoms</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.button>

        {/* Selected Condition Tags */}
        {selectedConditionNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedConditionNames.slice(0, 5).map((name) => (
              <span key={name} className="badge-pill text-xs">
                {name}
              </span>
            ))}
            {selectedConditionNames.length > 5 && (
              <span className="badge-pill text-xs bg-muted text-muted-foreground">
                +{selectedConditionNames.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditHealthInfoModal
          open={isEditing}
          onOpenChange={setIsEditing}
          age={age}
          heightValue={heightValue}
          heightUnit={heightUnit}
          weightValue={weightValue}
          weightUnit={weightUnit}
          bloodGroup={bloodGroup}
          onSave={(data) => {
            setAge(data.age);
            setHeightValue(data.heightValue);
            setHeightUnit(data.heightUnit);
            setWeightValue(data.weightValue);
            setWeightUnit(data.weightUnit);
            setBloodGroup(data.bloodGroup);
            setIsEditing(false);
          }}
        />
      )}

      <SelectBehaviorsModal
        open={showBehaviorsModal}
        onOpenChange={setShowBehaviorsModal}
        selectedBehaviors={selectedBehaviors}
        onSave={setSelectedBehaviors}
      />

      <SelectConditionsModal
        open={showConditionsModal}
        onOpenChange={setShowConditionsModal}
        selectedConditions={selectedConditionIds}
        otherText={conditionOtherText}
        onSave={(conditions, otherText) => {
          setConditions(conditions);
          setConditionOtherText(otherText);
        }}
      />
    </>
  );
}

// Edit Health Info Modal
interface EditHealthInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  age?: number;
  heightValue?: number;
  heightUnit: 'cm' | 'in';
  weightValue?: number;
  weightUnit: 'kg' | 'lbs';
  bloodGroup?: string;
  onSave: (data: { 
    age?: number; 
    heightValue?: number; 
    heightUnit: 'cm' | 'in'; 
    weightValue?: number;
    weightUnit: 'kg' | 'lbs';
    bloodGroup?: string;
  }) => void;
}

function EditHealthInfoModal({
  open,
  onOpenChange,
  age: initialAge,
  heightValue: initialHeightValue,
  heightUnit: initialHeightUnit,
  weightValue: initialWeightValue,
  weightUnit: initialWeightUnit,
  bloodGroup: initialBloodGroup,
  onSave,
}: EditHealthInfoModalProps) {
  const [age, setAge] = useState(initialAge?.toString() || '');
  const [heightValue, setHeightValue] = useState(initialHeightValue?.toString() || '');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(initialHeightUnit);
  const [weightValue, setWeightValue] = useState(initialWeightValue?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(initialWeightUnit);
  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup || '');

  const handleSave = () => {
    onSave({
      age: age ? parseInt(age) : undefined,
      heightValue: heightValue ? parseFloat(heightValue) : undefined,
      heightUnit,
      weightValue: weightValue ? parseFloat(weightValue) : undefined,
      weightUnit,
      bloodGroup: bloodGroup || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-lg bg-background rounded-t-[20px] p-6"
      >
        <h2 className="text-lg font-semibold text-center mb-6">Edit Health Info</h2>

        {/* Age */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="input-tarva"
          />
        </div>

        {/* Height */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Height</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              placeholder={heightUnit === 'cm' ? '175' : '70'}
              className="input-tarva flex-1"
            />
            <div className="flex bg-muted rounded-xl overflow-hidden">
              <button
                onClick={() => setHeightUnit('cm')}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors",
                  heightUnit === 'cm'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                cm
              </button>
              <button
                onClick={() => setHeightUnit('in')}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors",
                  heightUnit === 'in'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                in
              </button>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder={weightUnit === 'kg' ? '70' : '154'}
              className="input-tarva flex-1"
            />
            <div className="flex bg-muted rounded-xl overflow-hidden">
              <button
                onClick={() => setWeightUnit('kg')}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors",
                  weightUnit === 'kg'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                kg
              </button>
              <button
                onClick={() => setWeightUnit('lbs')}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors",
                  weightUnit === 'lbs'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Blood Group */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">Blood Group</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setBloodGroup(bg)}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium transition-colors",
                  bloodGroup === bg
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
