import { useState } from 'react';
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ForumGroupCard } from "@/components/forum/ForumGroupCard";
import { ForumGroupView } from "@/components/forum/ForumGroupView";
import { useForum, ForumGroup } from "@/contexts/ForumContext";
import { useHealthProfile } from "@/contexts/HealthProfileContext";
import { Users, Sparkles, Globe } from "lucide-react";

export default function Community() {
  const { groups, getGroupsForConditions } = useForum();
  const { conditions: userConditions } = useHealthProfile();
  const [selectedGroup, setSelectedGroup] = useState<ForumGroup | null>(null);

  const generalGroup = groups.find(g => g.isGeneral);
  const userGroups = getGroupsForConditions(userConditions);

  // Show group view if selected
  if (selectedGroup) {
    return <ForumGroupView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Community" subtitle="Connect with your community" />

        <div className="section-gap">
          {/* General Forum - always visible */}
          {generalGroup && (
            <section>
              <FadeIn delay={0.1}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <h2 className="text-section text-foreground">Open Forum</h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <ForumGroupCard
                  group={generalGroup}
                  onClick={() => setSelectedGroup(generalGroup)}
                />
              </FadeIn>
            </section>
          )}

          {/* User's condition-matched groups */}
          {userGroups.length > 0 && (
            <section>
              <FadeIn delay={0.2}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-section text-foreground">Your Groups</h2>
                </div>
              </FadeIn>
              <StaggerContainer className="space-y-3">
                {userGroups.map((group) => (
                  <StaggerItem key={group.id}>
                    <ForumGroupCard
                      group={group}
                      onClick={() => setSelectedGroup(group)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}

          {/* No conditions selected prompt */}
          {userConditions.length === 0 && (
            <FadeIn delay={0.25}>
              <div className="card-tarva text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 mx-auto mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Find your community</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Add conditions to your health profile to be automatically matched with people who share your experience.
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
