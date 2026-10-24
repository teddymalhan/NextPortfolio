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
    slug: "cloudreaper-alerts",
    name: "CloudReaper Alerts",
    title: "CloudReaper Alerts",
    tagline:
      "Orphaned AWS resource detection with scheduled scans, event-driven checks, and Slack alerts",
    period: "2026 – Present",
    year: 2026,
    technologies: [
      "Go",
      "AWS Lambda",
      "CloudFormation",
      "EventBridge",
      "SQS",
      "Slack API",
    ],
    type: "opensource",
    featured: true,
    description:
      "Finds orphaned AWS resources with Go Lambdas and sends alerts to Slack.",
    cta: "Explore CloudReaper Alerts",
    heroImage: "/cloudreaper-alerts.png",
    heroImageFit: "cover",
    cardImageLoading: "eager",
    gridClassName: "col-span-3 lg:col-span-2",
    href: "https://github.com/teddymalhan/cloudreaper-alerts",
    github: "https://github.com/teddymalhan/cloudreaper-alerts",
    links: [
      {
        label: "View on GitHub",
        href: "https://github.com/teddymalhan/cloudreaper-alerts",
        icon: "Github",
      },
      {
        label: "View Releases",
        href: "https://github.com/teddymalhan/cloudreaper-alerts/releases",
        icon: "ExternalLink",
      },
    ],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "CloudReaper Alerts finds orphaned AWS resources and sends alerts to Slack. It runs inside your AWS account without an EC2 host or long-running daemon.",
          "A guided CLI runs on macOS, Linux, and Windows. It validates AWS and Slack access, uploads release artifacts, and deploys the CloudFormation stack. An initial scan checks that alerts reach Slack.",
        ],
      },
      {
        title: "Detection and delivery",
        paragraphs: [
          "An EventBridge schedule invokes the scanner Lambda every 15 minutes. Optional CloudTrail events invoke a reactor Lambda to detect orphaned EC2 resources in near real time.",
          "An SQS queue passes findings to the notifier Lambda, which posts them to Slack. A dead-letter queue holds messages that fail delivery. AWS Secrets Manager stores the bot credentials.",
        ],
      },
      {
        title: "Operations",
        paragraphs: [
          "The Go CLI installs the system through CloudFormation. It also checks status, runs immediate scans, sends test alerts, and uninstalls the system. Terraform and Floci support local integration testing.",
          "Automated releases publish CLI archives for macOS, Linux, and Windows. They also publish deployable Lambda packages for amd64 and arm64.",
        ],
      },
    ],
    timeline: [{ date: "2026 – Present" }],
    tools: [
      "Go",
      "AWS Lambda",
      "AWS CloudFormation",
      "Amazon EventBridge",
      "Amazon SQS",
      "AWS Secrets Manager",
      "AWS CloudTrail",
      "Slack API",
      "Terraform",
      "Floci",
      "GoReleaser",
    ],
  },
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
      "A distributed key-value database in Go with crash-safe storage and Raft replication.",
    cta: "Explore PallasDB",
    heroImage: "/pallasdb-banner.png",
    heroImageFit: "cover",
    detailHeroImageFit: "contain",
    detailHeroAspect: "banner",
    gridClassName: "col-span-3 lg:col-span-1",
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
        paragraphs: [
          "PallasDB is a self-hosted key-value database for platform teams. It stores versioned service metadata and runtime configuration and includes observability. Cluster mode provides strongly consistent writes.",
          "The Go implementation encodes data as raw bytes and persists it in sorted storage. It includes a SQL layer, a gRPC API, and a server mode that uses Raft for replication.",
        ],
      },
      {
        title: "Storage engine",
        paragraphs: [
          "Before acknowledging a committed change, the engine writes it to a write-ahead log with fsync and CRC32 checksums. A sorted in-memory memtable flushes to durable SSTables. Multi-level merge iterators and compaction keep range scans ordered.",
          "The embedded engine supports snapshot transactions with conflict detection. A recursive-descent SQL parser and expression evaluator handle table operations.",
        ],
      },
      {
        title: "Distributed operation",
        paragraphs: [
          "The gRPC API exposes Get, Put, Delete, and server-streaming Range operations over Protocol Buffers. In cluster mode, the leader applies writes to the storage engine as Raft commands.",
          "HashiCorp Raft replicates writes with strong consistency. Serf gossip discovers cluster members. Nodes can read from their local finite state machine. To restore a snapshot, a node swaps the storage directory atomically.",
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
    slug: "argus",
    name: "Argus",
    title: "Argus",
    tagline: "Version control for quantitative research models, datasets, and experiment results",
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
      "Won nwHacks 2026. Version control for quantitative research models, datasets and results.",
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
        title: "The problem",
        paragraphs: [
          "At a Connor, Clark & Lunn Investment Management panel, we learned how quantitative researchers validate trading signals. They run hundreds of model iterations across datasets and compare each run's Information Coefficient, Rank IC, and t-statistics.",
          "Git tracks code changes, but it doesn't record which model and dataset produced a given score. Researchers tracked those combinations in spreadsheets, notebooks, and manual notes. They had no single view of their experiments.",
        ],
      },
      {
        title: "Experiment records",
        paragraphs: [
          "Argus gives each model run a unique hash. An immutable record stores the model, dataset, and performance metrics for that run. Researchers can query past experiments, compare results, and replay runs deterministically.",
          "A terminal UI lets researchers commit and review runs without leaving the command line.",
        ],
      },
      {
        title: "Architecture",
        paragraphs: [
          "Rust handles hashing and versioning. Python middleware connects that engine to a Textual terminal UI.",
          "Gemini AI summarizes model runs and their metrics. SQLite stores records locally. Vultr backs up models and datasets in the cloud for collaboration and remote access.",
        ],
      },
      {
        title: "The nwHacks build",
        paragraphs: [
          "We built Argus in 36 hours at nwHacks 2026 while learning the quantitative finance concepts behind it. The hardest technical part was connecting the Rust engine to Python and the Textual terminal UI.",
          "Argus won nwHacks 2026. Its hash-based records preserve the models, datasets, and results used in each experiment for later review.",
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
      "Real-time performance tracking for more than 1,000 agents, with 60% less manual review time",
    period: "January 2025 - April 2025 (Internship)",
    year: 2024,
    technologies: ["Vue.js", "Django", "Python", "Google Cloud Platform"],
    type: "internship",
    description:
      "Cut manual call review time by 60% thousands of agents using Dialpad.",
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
        paragraphs: [
          "I built Digital Scorecards during my software engineering internship at Dialpad. Contact center managers use it to evaluate calls against configurable scoring criteria and track agent performance in real time.",
          "I designed the scoring system, built the application, and shipped it. The application serves more than 1,000 agents and reduced manual review time by 60%.",
        ],
      },
      {
        title: "The problem",
        paragraphs: [
          "Managers spent hours listening to call recordings and filling out subjective evaluation forms. Agents received delayed, inconsistent feedback.",
          "Dialpad needed a system that scored interactions against configurable criteria so managers and agents could see results immediately.",
        ],
      },
      {
        title: "Implementation",
        paragraphs: [
          "I built the frontend with Vue.js. WebSocket connections update the dashboard in real time. Managers can set evaluation criteria and scoring weights, review individual agents, and compare team trends.",
          "The Django backend calculates scores, aggregates them, and generates reports. It runs on Google Cloud Platform with PostgreSQL and Memcached. Response times stay below 200 milliseconds under high query volumes, and uptime is 99.9%.",
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

