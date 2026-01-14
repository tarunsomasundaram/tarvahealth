import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn } from "@/components/animations";
import { MessageCircle } from "lucide-react";

export default function Forum() {
  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Forum" subtitle="Connect with your community" />

        <div className="section-gap">
          <FadeIn delay={0.1}>
            <div className="card-tarva text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Connect with others who share similar health conditions in a safe, anonymous community.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  );
}
