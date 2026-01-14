import { useState } from 'react';
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ForumGroupCard } from "@/components/forum/ForumGroupCard";
import { ForumGroupView } from "@/components/forum/ForumGroupView";
import { useForum, ForumGroup } from "@/contexts/ForumContext";
import { useHealthProfile } from "@/contexts/HealthProfileContext";
import { conditions } from "@/data/conditions";
import { MessageCircle, Search, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Forum() {
  const { groups, getGroupsForConditions, getSuggestedGroups } = useForum();
  const { conditions: userConditions } = useHealthProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ForumGroup | null>(null);

  const userGroups = getGroupsForConditions(userConditions);
  const suggestedGroups = getSuggestedGroups(userConditions);
  
  // Filter all groups by search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conditions.find(c => c.id === group.conditionId)?.synonyms.some(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Show group view if selected
  if (selectedGroup) {
    return <ForumGroupView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Forum" subtitle="Connect with your community" />

        <div className="section-gap">
          {/* Search */}
          <FadeIn delay={0.1}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </FadeIn>

          {/* No conditions selected */}
          {userConditions.length === 0 && !searchQuery && (
            <FadeIn delay={0.15}>
              <div className="card-tarva text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 mx-auto mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Find your community</h2>
                <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto">
                  Add conditions to your profile to see personalized group recommendations.
                </p>
                <p className="text-xs text-muted-foreground">
                  Or browse all groups below
                </p>
              </div>
            </FadeIn>
          )}

          {/* User's Groups */}
          {userGroups.length > 0 && !searchQuery && (
            <section>
              <FadeIn delay={0.15}>
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

          {/* Suggested Groups */}
          {suggestedGroups.length > 0 && !searchQuery && (
            <section>
              <FadeIn delay={0.2}>
                <h2 className="text-section text-foreground mb-3">Suggested for you</h2>
              </FadeIn>
              <StaggerContainer className="space-y-3">
                {suggestedGroups.map((group) => (
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

          {/* Search Results or All Groups */}
          <section>
            <FadeIn delay={0.25}>
              <h2 className="text-section text-foreground mb-3">
                {searchQuery ? `Results for "${searchQuery}"` : 'Browse all groups'}
              </h2>
            </FadeIn>
            
            {filteredGroups.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {filteredGroups.slice(0, searchQuery ? 20 : 10).map((group) => (
                  <StaggerItem key={group.id}>
                    <ForumGroupCard
                      group={group}
                      onClick={() => setSelectedGroup(group)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="card-tarva text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No groups found for "{searchQuery}"</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
