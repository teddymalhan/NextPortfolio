/**
 * Project data types and content for portfolio
 */

// Terminal animation step types
export interface TerminalStep {
  text: string;
  type: "command" | "output" | "success" | "error" | "progress";
  delay?: number;
}

// Feature bullet with colored dot
export interface ProjectFeature {
  text: string;
  dotColor: string;
}

// External link for sidebar
export interface ProjectLink {
  label: string;
  href: string;
  icon: "ExternalLink" | "Github" | "Youtube" | "FileText" | "Play";
}

// Timeline entry
export interface TimelineEntry {
  date: string;
  event?: string;
}

// Media for demo section
export interface ProjectMedia {
  type: "image" | "video" | "gif";
  src: string;
  alt: string;
  caption?: string;
}

// Content section (Overview, Background, etc.)
export interface ContentSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  emoji?: string;
  image?: { src: string; alt: string; caption?: string };
}

// Project type categories
export type ProjectType = "internship" | "hackathon" | "personal" | "opensource";

// Full project data
export interface Project {
  // Identity
  slug: string;
  name: string;
  title: string;
  tagline?: string;

  // Metadata
  period: string;
  year: number;
  technologies: string[];
  type: ProjectType;
  featured?: boolean;
  award?: string;

  // Card content
  description: string;
  cta: string;
  heroImage: string;
  heroImageFit?: "cover" | "contain";
  cardImageLoading?: "eager" | "lazy";
  gridClassName: string;

  // External links
  href: string;
  github?: string;
  demo?: string;
  links: ProjectLink[];

  // Detail page - Hero
  desktopMockup?: string;
  mobileMockups?: string[];
  detailHeroImageFit?: "cover" | "contain";
  detailHeroAspect?: "standard" | "banner";

  // Detail page - Demo
  demoMedia?: ProjectMedia;

  // Detail page - Content
  sections: ContentSection[];

  // Detail page - Sidebar
  timeline: TimelineEntry[];
  tools: string[];
}

// Simplified type for bento card display
type BentoProject = Pick<
  Project,
  | "slug"
  | "name"
  | "title"
  | "period"
  | "description"
  | "cta"
  | "technologies"
  | "featured"
  | "award"
  | "type"
  | "heroImage"
  | "heroImageFit"
  | "cardImageLoading"
  | "gridClassName"
>;

// Project data
const projects: Project[] = [
  {
    slug: "pallasdb",
    name: "PallasDB",
    title: "PallasDB",
    tagline:
      "A self-hosted, distributed key-value database in Go with an LSM storage engine and Raft-backed replication",
    period: "2026 – Present",
    year: 2026,
    technologies: [
      "Go",
      "LSM Trees",
      "Write-Ahead Log",
      "SSTables",
      "gRPC",
      "Protocol Buffers",
      "HashiCorp Raft",
      "Serf",
    ],
    type: "opensource",
    featured: true,
    description:
      "Built a distributed key-value database in Go with crash-safe WAL persistence, SSTable compaction, gRPC APIs, and Raft-backed replication.",
    cta: "Explore PallasDB",
    heroImage: "/pallasdb-banner.png",
    heroImageFit: "cover",
    cardImageLoading: "eager",
    detailHeroImageFit: "contain",
    detailHeroAspect: "banner",
    gridClassName: "col-span-3 lg:col-span-2",
    href: "https://pallasdb.com",
    github: "https://github.com/PallasDB/PallasDB",
    links: [
      {
        label: "Visit PallasDB",
        href: "https://pallasdb.com",
        icon: "ExternalLink",
      },
      {
        label: "View on GitHub",
        href: "https://github.com/PallasDB/PallasDB",
        icon: "Github",
      },
      {
        label: "Read Documentation",
        href: "https://pallasdb.github.io/docs/",
        icon: "FileText",
      },
    ],
    sections: [
      {
        title: "Overview",
        emoji: "🗄️",
        paragraphs: [
          "PallasDB is an operator-owned, self-hosted key-value data plane for platform teams. It keeps service metadata and runtime configuration revisioned, observable, and strongly consistent across a cluster.",
          "The database is built from first principles in Go: raw byte encoding, crash-safe persistence, sorted storage, a SQL layer, gRPC transport, and Raft-backed server mode.",
        ],
      },
      {
        title: "Storage Engine",
        emoji: "⚙️",
        paragraphs: [
          "Every committed write is persisted through a write-ahead log with fsync and CRC32 checksums before it is acknowledged. A sorted in-memory memtable flushes to durable SSTables, while multi-level merge iterators and compaction maintain an ordered view for range scans.",
          "The embedded engine also provides snapshot transactions with conflict detection, plus a recursive-descent SQL parser and expression evaluator for table operations.",
        ],
      },
      {
        title: "Distributed Operation",
        emoji: "🌐",
        paragraphs: [
          "The gRPC API exposes Get, Put, Delete, and server-streaming Range operations over Protocol Buffers. In cluster mode, mutating requests are encoded as Raft commands and applied by the leader to the storage engine.",
          "HashiCorp Raft provides strongly consistent replicated writes, while Serf gossip discovers cluster members. Nodes can serve reads from local FSM state, and snapshots restore state by atomically swapping the storage directory.",
        ],
      },
    ],
    timeline: [{ date: "2026 – Present" }],
    tools: [
      "Go 1.25",
      "LSM Trees",
      "Write-Ahead Log",
      "SSTables",
      "MVCC Transactions",
      "SQL",
      "gRPC",
      "Protocol Buffers",
      "HashiCorp Raft",
      "Serf",
      "Cobra",
      "Viper",
    ],
  },
  {
    slug: "retrowatch",
    name: "RetroWatch",
    title: "RetroWatch",
    tagline: "Watch content on a CRT with AI-generated era-relevant ads",
    period: "December 2025 - January 2026",
    year: 2025,
    technologies: [
      "Java",
      "Spring Boot",
      "React",
      "Vite",
      "Google Cloud",
    ],
    type: "personal",
    description:
      "Streaming platform that simulates watching TV on a vintage CRT. Complete with scan lines, color bleeding, and AI-generated period-appropriate ads. Built with Spring Boot and React, deployed serverless on Google Cloud.",
    cta: "View Project",
    heroImage: "/retrowatch.png",
    gridClassName: "col-span-3 lg:col-span-1",
    href: "https://full-stack-app-467902453710.us-west1.run.app/",
    demo: "https://full-stack-app-467902453710.us-west1.run.app/",
    links: [
      {
        label: "View Live Demo",
        href: "https://retrowatch.malhan.ca/",
        icon: "ExternalLink",
      },
      {
        label: "View on GitHub",
        href: "https://github.com/teddymalhan/RetroWatch",
        icon: "Github",
      },
      {
        label: "API Documentation",
        href: "https://retrowatch.malhan.ca/docs/",
        icon: "FileText",
      },
    ],
    sections: [
      {
        title: "Overview",
        emoji: "📺",
        paragraphs: [
          "Remember watching Saturday morning cartoons on a chunky CRT TV? RetroWatch recreates that experience for the modern web. Vintage television aesthetics with generative AI creating period-accurate advertisements.",
          "Watch your favorite content with authentic CRT effects. Scan lines, color bleeding, screen curvature, and analog artifacts. The AI analyzes your content and generates ads that would've actually aired during that era.",
        ],
      },
      {
        title: "Technical Architecture",
        emoji: "🏗️",
        paragraphs: [
          "Backend runs on Java and Spring Boot, deployed to Google Cloud Run for serverless auto-scaling. Google Cloud Tasks handles asynchronous ad generation. It processes video content through generative AI to create vintage advertisements that match the era.",
          "Frontend built with React and Vite delivers smooth 60fps CRT simulation. CSS shaders and filters recreate authentic analog TV artifacts. Phosphor glow, chromatic aberration, and frame persistence. All while maintaining responsive performance across devices.",
        ],
      },
    ],
    timeline: [{ date: "December 2025 - January 2026" }],
    tools: [
      "Java 21",
      "Spring Boot 3",
      "React 18",
      "Vite",
      "Google Cloud Run",
      "Google Cloud Tasks",
      "Generative AI",
    ],
  },
  {
    slug: "argus",
    name: "Argus",
    title: "Argus",
    tagline: "Version control for quantitative research experiments. Git, but for models and datasets",
    period: "nwHacks 2026 Winner",
    year: 2026,
    technologies: [
      "Rust",
      "Python",
      "Textual",
      "Gemini AI",
      "Vultr",
    ],
    type: "hackathon",
    featured: true,
    description:
      "Won nwHacks 2026 building a version control system for quant researchers. Track model runs, datasets, and performance metrics (IC, Rank IC, t-stats) with hash-based versioning. Built with Rust and Python TUI.",
    cta: "View Project",
    heroImage: "/argus.png",
    gridClassName: "col-span-3 lg:col-span-1",
    href: "https://github.com/teddymalhan/argus",
    github: "https://github.com/teddymalhan/argus",
    links: [
      {
        label: "View on GitHub",
        href: "https://github.com/teddymalhan/argus",
        icon: "Github",
      },
    ],
    sections: [
      {
        title: "The Problem",
        emoji: "💡",
        paragraphs: [
          "After attending a Connor, Clark & Lunn Investment Management panel, we learned that quant researchers run hundreds of model iterations across different datasets to validate trading signals. Each run generates critical metrics (Information Coefficient, Rank IC, t-statistics) that need to be tracked and compared.",
          "Git doesn't work for this workflow. It tracks code changes, but not the actual models, datasets, or performance metrics. Researchers were juggling spreadsheets, notebooks, and manual documentation just to remember which model and dataset combination produced which IC scores. There was no bird's-eye view of experiments.",
        ],
      },
      {
        title: "The Solution",
        emoji: "🎯",
        paragraphs: [
          "Argus brings Git-style version control to quantitative research. Every model run gets a unique hash, storing the exact model, dataset, and performance metrics (IC, Rank IC, t-stat) in an immutable record. Query past experiments, compare results, and replay any run deterministically.",
          "Think git commit but for your trading models. Argus integrates directly into research workflows via a terminal UI. Makes experiment tracking as natural as version controlling code.",
        ],
      },
      {
        title: "Technical Architecture",
        emoji: "🏗️",
        paragraphs: [
          "Core hashing and versioning engine written in Rust for performance and immutability guarantees. Python middleware connects Rust to the Textual-based terminal UI. Provides a native command-line experience that fits into existing workflows.",
          "Gemini AI automatically generates summaries of model runs, extracting insights from metrics. SQLite provides fast local storage while Vultr handles long-term cloud backup of models and datasets. This enables collaboration and remote experiment access.",
        ],
      },
      {
        title: "Winning nwHacks",
        emoji: "🏆",
        paragraphs: [
          "Built the entire system in 36 hours. From learning quantitative finance concepts to shipping a working terminal UI. The biggest technical challenge was integrating Rust with Python while maintaining a smooth command-line interface.",
          "Judges recognized Argus for solving a real problem in quantitative finance with technical depth. The hash-based versioning system provides immutable audit trails, which is critical for reproducible research in financial modeling.",
        ],
      },
      {
        title: "What's Next",
        emoji: "🚀",
        paragraphs: [
          "Native Jupyter Notebook integration is next. Most quant researchers live in notebooks, so we're building a seamless plugin that lets them commit runs without leaving their research environment.",
        ],
      },
    ],
    timeline: [{ date: "January 2026" }],
    tools: [
      "Rust",
      "Python",
      "Textual",
      "Gemini AI",
      "SQLite",
      "Vultr",
    ],
  },
  {
    slug: "digital-scorecards",
    name: "Digital Scorecards",
    title: "Digital Scorecards at Dialpad",
    tagline:
      "Real-time performance tracking that cut manual review time by 60% for 1000+ agents",
    period: "January 2025 - April 2025 (Internship)",
    year: 2024,
    technologies: ["Vue.js", "Django", "Python", "Google Cloud Platform"],
    type: "internship",
    description:
      "Built a performance tracking system at Dialpad that serves 1000+ contact center agents. Full-stack Vue.js and Django app deployed on GCP with 99.9% uptime.",
    cta: "Read More",
    heroImage: "/digital_scorecards.webp",
    gridClassName: "col-span-3 lg:col-span-2",
    href: "https://www.dialpad.com/blog/new-dialpad-features-and-updates-for-the-enterprise-contact-center/?utm_source=chatgpt.com#:~:text=Digital%20dispositions%20and-,digital%20scorecards,-bring%20accountability%20and",
    github: "#",
    demo: "https://www.dialpad.com/blog/new-dialpad-features-and-updates-for-the-enterprise-contact-center/?utm_source=chatgpt.com#:~:text=Digital%20dispositions%20and-,digital%20scorecards,-bring%20accountability%20and",
    links: [
      {
        label: "Read Blog Post",
        href: "https://www.dialpad.com/blog/new-dialpad-features-and-updates-for-the-enterprise-contact-center/",
        icon: "ExternalLink",
      },
    ],
    sections: [
      {
        title: "Overview",
        emoji: "📋",
        paragraphs: [
          "Contact center managers at Dialpad needed a way to measure agent performance without spending hours manually reviewing calls. I built Digital Scorecards to automate this. Real-time performance tracking with customizable scoring criteria.",
          "I designed and built the full-stack solution as a Software Engineering Intern. From architecting the scoring system to shipping to production. The feature now serves 1000+ agents and reduced manual review time by 60%.",
        ],
      },
      {
        title: "The Problem",
        emoji: "📚",
        paragraphs: [
          "Traditional performance reviews in contact centers were broken. Managers spent hours listening to call recordings and filling out subjective evaluation forms. Agents received delayed, inconsistent feedback. At scale, this couldn't work.",
          "Dialpad needed an automated system that could score interactions based on configurable criteria. Give managers instant insights and give agents clear feedback on their performance.",
        ],
      },
      {
        title: "Technical Implementation",
        emoji: "⚙️",
        paragraphs: [
          "Built the frontend with Vue.js. Real-time dashboard updated via WebSocket connections. Managers can define custom evaluation criteria with weighted scoring, drill down into individual agent performance or view team-level trends.",
          "The Django backend handles score calculation, aggregation, and automated report generation. Deployed on Google Cloud Platform with PostgreSQL and Memcached. The system handles high query volumes with sub-200ms response times and 99.9% uptime.",
        ],
      },
    ],
    timeline: [{ date: "Spring 2025" }],
    tools: [
      "Vue.js 3",
      "Django 4",
      "Python 3.11",
      "Google Cloud Platform",
      "PostgreSQL",
      "Memcached",
      "WebSockets",
    ],
  },
  

  {
    slug: "kaeru",
    name: "Kaeru",
    title: "Kaeru",
    tagline: "AI agents that cancel subscriptions and dispute fraud charges so you don't have to",
    period: "SFU Surge StormHacks 2025",
    year: 2024,
    technologies: [
      "Next.js",
      "AWS Amplify",
      "TypeScript",
      "AI Agents",
      "Plaid API",
      "VAPI",
    ],
    type: "personal",
    featured: true,
    description:
      "Financial operations platform with AI agents that make phone calls and send emails to cancel subscriptions. Real-time fraud detection monitors transactions 24/7 and automatically files disputes. Built at StormHacks 2025.",
    cta: "Learn More",
    heroImage: "/kaeru.png",
    gridClassName: "col-span-3 lg:col-span-2",
    href: "https://kaeru-fawn.vercel.app/",
    github: "https://github.com/teddymalhan/kaeru",
    demo: "https://kaeru-fawn.vercel.app/",
    links: [
      {
        label: "View Live Demo",
        href: "https://kaeru-fawn.vercel.app/",
        icon: "ExternalLink",
      },
      {
        label: "View on GitHub",
        href: "https://github.com/teddymalhan/kaeru",
        icon: "Github",
      },
    ],
    sections: [
      {
        title: "Overview",
        emoji: "📋",
        paragraphs: [
          "Ever spent an hour on hold trying to cancel a gym membership? Or discovered a fraudulent charge and dreaded the dispute process? Kaeru automates these painful financial tasks using AI agents that make calls and send emails on your behalf.",
          "Built at StormHacks 2025 with Next.js and AWS. Kaeru connects to your bank accounts via Plaid, monitors transactions in real-time for fraud, and dispatches AI agents to handle cancellations and disputes. No more dealing with customer service hell.",
        ],
      },
      {
        title: "How It Works",
        emoji: "✨",
        paragraphs: [
          "Smart Cancellations: Select a subscription to cancel, and Kaeru's AI agents automatically call the company, navigate phone trees, speak to representatives, and handle the cancellation. You get notified when it's done. No hold music, no scripted retention offers.",
          "Real-Time Fraud Detection: Kaeru monitors all transactions 24/7 using AI risk scoring. Suspicious charges trigger automatic alerts. With your approval, AI agents file disputes with your bank. Complete with documentation and follow-up calls if needed.",
        ],
      },
    ],
    timeline: [{ date: "October 2025" }],
    tools: [
      "Next.js 14",
      "TypeScript",
      "AWS Amplify",
      "Plaid API",
      "VAPI",
      "TailwindCSS",
      "AI Agents",
    ],
  },
  {
    slug: "gradgains",
    name: "GradGains",
    title: "GradGains",
    tagline: "Am I spending too much on food? Financial social platform with peer comparisons",
    period: "Google DSC Hack-The-Sem Winner (January 2024 - April 2024)",
    year: 2024,
    technologies: ["Drizzle ORM", "React", "Next.js"],
    type: "hackathon",
    featured: true,
    description:
      "Won Hack-The-Sem 2024 building a financial platform for students. Track spending, set budgets, and see how your expenses compare to peers (anonymized). Gamification makes budgeting engaging.",
    cta: "View Project",
    heroImage: "/grad-gains.png",
    gridClassName: "col-span-3 lg:col-span-1",
    href: "https://github.com/teddymalhan/grad-gains",
    github: "https://github.com/teddymalhan/grad-gains",
    demo: "#",
    links: [
      {
        label: "View on GitHub",
        href: "https://github.com/teddymalhan/grad-gains",
        icon: "Github",
      },
    ],
    sections: [
      {
        title: "Overview",
        emoji: "📋",
        paragraphs: [
          "Students constantly wonder: Am I spending too much on food? Is my rent reasonable? Are my entertainment expenses out of control? GradGains answers these questions by combining personal finance tracking with anonymized peer comparisons.",
          "Won Hack-The-Sem 2024 for making financial literacy engaging. Track expenses, set budgets, and see how you compare to students in similar situations. Gamification (achievements, streaks, challenges) makes budgeting fun.",
        ],
      },
      {
        title: "Why Social Context Matters",
        emoji: "👥",
        paragraphs: [
          "Financial decisions are heavily influenced by social context. A student spending $400/month on food might feel anxious about it. But if their peers with similar meal plans spend $450, suddenly that number makes sense.",
          "GradGains provides anonymized comparisons by category (food, rent, entertainment, etc.). This helps students understand their spending without compromising anyone's privacy. No judgment, just context. Gamification elements (achievements for hitting savings goals, streaks for tracking expenses) make personal finance engaging.",
        ],
      },
    ],
    timeline: [{ date: "Jan 2024 - Apr 2024" }],
    tools: [
      "Next.js 14",
      "React",
      "Drizzle ORM",
      "PostgreSQL",
      "TailwindCSS",
      "NextAuth.js",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getBentoProjects(): BentoProject[] {
  return projects.map(
    ({
      slug,
      name,
      title,
      period,
      description,
      cta,
      technologies,
      featured,
      award,
      type,
      heroImage,
      heroImageFit,
      cardImageLoading,
      gridClassName,
    }) => ({
      slug,
      name,
      title,
      period,
      description,
      cta,
      technologies,
      featured,
      award,
      type,
      heroImage,
      heroImageFit,
      cardImageLoading,
      gridClassName,
    })
  );
}

