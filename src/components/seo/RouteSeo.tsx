import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://tarvahealth.lovable.app";

const DEFAULT_META = {
  title: "Tarva Health — Smart Pill Case & Medication Tracker",
  description:
    "Track every dose, sync your smart pill case over Bluetooth, and keep caregivers in the loop with Tarva Health.",
};

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Today's Doses — Tarva Health",
    description:
      "See today's medication schedule, mark doses as taken in one tap, and stay on track with smart reminders from Tarva Health.",
  },
  "/medications": {
    title: "My Medications — Tarva Health",
    description:
      "Manage your medication list, dosages and schedules in one place, and keep your smart pill case inventory up to date.",
  },
  "/add": {
    title: "Add a Medication — Tarva Health",
    description:
      "Add a new medication with its dosage, schedule and refill reminders so Tarva Health can track every dose for you.",
  },
  "/stats": {
    title: "Adherence Stats — Tarva Health",
    description:
      "Review your medication adherence trends, streaks and missed doses with clear weekly and monthly health insights.",
  },
  "/calendar": {
    title: "Dose Calendar — Tarva Health",
    description:
      "Browse your full medication history day by day and see which doses were taken, skipped or missed over time.",
  },
  "/case": {
    title: "Smart Pill Case — Tarva Health",
    description:
      "Pair and monitor your Tarva smart pill case over Bluetooth, check battery level and track pill inventory automatically.",
  },
  "/caregivers": {
    title: "Caregivers — Tarva Health",
    description:
      "Invite trusted caregivers, control exactly what they can see, and let them get alerts when a dose is missed.",
  },
  "/community": {
    title: "Community — Tarva Health",
    description:
      "Join condition-based groups to share experiences, ask questions and get support from others managing medications.",
  },
  "/profile": {
    title: "Your Profile — Tarva Health",
    description:
      "Manage your health profile, conditions and personal details used to personalise your Tarva Health reminders.",
  },
  "/settings": {
    title: "Settings — Tarva Health",
    description:
      "Adjust reminders, notifications, privacy and account preferences for your Tarva Health medication tracker.",
  },
  "/notifications": {
    title: "Notifications — Tarva Health",
    description:
      "Review dose reminders, refill alerts and caregiver updates from your Tarva Health medication tracker.",
  },
  "/welcome": {
    title: "Welcome to Tarva Health",
    description:
      "Discover how Tarva Health combines a smart pill case with reminders and caregiver support to make doses effortless.",
  },
  "/auth": {
    title: "Sign In — Tarva Health",
    description:
      "Sign in or create a Tarva Health account to track medications, sync your smart pill case and share progress securely.",
  },
  "/caregiver": {
    title: "Caregiver Dashboard — Tarva Health",
    description:
      "Follow the adherence of the people you care for, see missed doses at a glance and act on escalation alerts quickly.",
  },
  "/caregiver/stats": {
    title: "Patient Adherence — Tarva Health",
    description:
      "Review adherence trends for the people you care for, with weekly summaries of taken, skipped and missed doses.",
  },
  "/caregiver/calendar": {
    title: "Patient Dose Calendar — Tarva Health",
    description:
      "Browse a day-by-day dose history for the people you care for and spot patterns in missed medication quickly.",
  },
};

export function RouteSeo() {
  const { pathname } = useLocation();
  const meta = ROUTE_META[pathname] ?? DEFAULT_META;
  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
}
