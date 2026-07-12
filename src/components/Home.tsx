import { Link } from "react-router-dom";
import {
  MessageCircle,
  Video,
  Phone,
  Users,
  Image as ImageIcon,
  Radio,
  ArrowRight,
} from "lucide-react";
import { Badge } from "./shared/Badge";
import { Eyebrow } from "./shared/Eyebrow";
import Logo from "./shared/Logo";

const features = [
  {
    icon: MessageCircle,
    title: "Real-time messaging",
    description:
      "Messages land instantly over a live socket connection — no refreshing, no delay.",
  },
  {
    icon: Video,
    title: "Face-to-face video calls",
    description:
      "Peer-to-peer video calling, connected directly between you and your friend.",
  },
  {
    icon: Phone,
    title: "Audio calls",
    description:
      "Prefer to just talk? Drop into a clear voice call in one tap, no video required.",
  },
  {
    icon: Users,
    title: "A friend network you control",
    description:
      "Send requests, accept on your terms, and unfriend whenever you want. No public follower counts.",
  },
  {
    icon: ImageIcon,
    title: "Posts with photos & video",
    description:
      "Share updates with attached media, and react or comment on what your friends post.",
  },
  {
    icon: Radio,
    title: "See who's online, live",
    description:
      "Your friends list updates in real time, so you know exactly who's around to talk right now.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up with your email — takes under a minute.",
  },
  {
    step: "02",
    title: "Add your friends",
    description: "Search, send a request, and connect once they accept.",
  },
  {
    step: "03",
    title: "Start talking",
    description: "Chat, call, or post — all in one place.",
  },
];

const Navbar = () => (
  <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/">
        <Logo />
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/login">
          <button className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 transition-colors">
            Log in
          </button>
        </Link>
        <Link to="/signup">
          <button className="text-sm inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-(--radius) font-semibold transition-opacity">
            Sign up
          </button>
        </Link>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-card border-t border-border px-6 py-12">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <Logo />
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/login" className="hover:text-primary transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-primary transition-colors">
            Sign up
          </Link>
        </div>
      </div>
      <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} PratConnect. All rights reserved.
        </span>
        <span>Built for friends, not feeds.</span>
      </div>
    </div>
  </footer>
);

const Home = () => {
  return (
    <div className="bg-background text-foreground font-sans">
      <Navbar />

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-3xl mx-auto text-center">
        <Eyebrow>Real-time social, without the noise</Eyebrow>
        <h1 className="text-4xl md:text-6xl font-bold text-primary mt-3 mb-6 leading-tight">
          One place to chat, call, and stay in touch
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          PratConnect is a friends-only network for messaging, video and audio
          calls, and sharing posts — built to feel instant, not bloated.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-3 rounded-(--radius) font-semibold transition-opacity">
              Create your account
              <ArrowRight className="size-4" />
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-card text-card-foreground border border-border hover:bg-muted px-6 py-3 rounded-(--radius) font-semibold transition-colors">
              Log in
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">
              Everything you need to stay connected
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-background border border-border rounded-(--radius) p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-primary mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Eyebrow>Getting started</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">
              Up and running in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }) => (
              <div key={step}>
                <Badge variant="accent" className="mb-4">
                  Step {step}
                </Badge>
                <h3 className="font-semibold text-primary mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-20 bg-primary text-primary-foreground text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Your friends are waiting
        </h2>
        <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">
          No ads, no algorithm feed — just the people you actually know.
        </p>
        <Link to="/signup">
          <button className="inline-flex items-center gap-2 bg-primary-foreground text-primary hover:opacity-90 px-6 py-3 rounded-(--radius) font-semibold transition-opacity">
            Get started for free
            <ArrowRight className="size-4" />
          </button>
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
