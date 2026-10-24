export interface TechnicalTerm {
  title: string;
  aliases: string[];
  description: string;
  image: { src: string; alt: string };
}

const technicalTerms: TechnicalTerm[] = [
  {
    title: "Amazon EC2",
    aliases: ["EC2"],
    image: { src: "/technical-terms/ec2.svg", alt: "Amazon EC2 service icon." },
    description: "AWS's virtual servers. CloudReaper checks for resources left behind when these servers are no longer in use, helping teams spot unnecessary cloud costs.",
  },
  {
    title: "Command-line interface (CLI)",
    aliases: ["CLI"],
    image: { src: "/technical-terms/cli.svg", alt: "A terminal command lists files as text output." },
    description: "A tool operated by typing commands rather than clicking through a website. CloudReaper's CLI guides users through installation and day-to-day operations.",
  },
  {
    title: "AWS CloudFormation",
    aliases: ["CloudFormation"],
    image: { src: "/technical-terms/cloudformation.svg", alt: "AWS CloudFormation service icon." },
    description: "Defines and deploys AWS infrastructure from a template. CloudReaper uses it to install its functions, queues, and permissions as one repeatable stack.",
  },
  {
    title: "Amazon EventBridge",
    aliases: ["EventBridge"],
    image: { src: "/technical-terms/eventbridge.svg", alt: "Amazon EventBridge event-routing service icon." },
    description: "An AWS service for routing events and scheduling work. In CloudReaper, its schedule starts a scan every 15 minutes without an always-running server.",
  },
  {
    title: "AWS Lambda",
    aliases: ["AWS Lambda", "Lambda"],
    image: { src: "/technical-terms/lambda.svg", alt: "AWS Lambda service icon." },
    description: "Runs code on demand without managing a server. CloudReaper splits scanning, event handling, and Slack notifications into separate Lambda functions.",
  },
  {
    title: "AWS CloudTrail",
    aliases: ["CloudTrail"],
    image: { src: "/technical-terms/cloudtrail.svg", alt: "AWS CloudTrail service icon." },
    description: "Records activity in an AWS account. CloudReaper can react to these events to detect orphaned resources sooner than the next scheduled scan.",
  },
  {
    title: "Amazon SQS",
    aliases: ["SQS"],
    image: { src: "/technical-terms/sqs.svg", alt: "Amazon Simple Queue Service icon." },
    description: "A managed message queue. It buffers CloudReaper's findings between scanning and notification, so those stages can run independently.",
  },
  {
    title: "Dead-letter queue",
    aliases: ["dead-letter queue"],
    image: { src: "/technical-terms/dead-letter-queue.svg", alt: "Successful messages finish processing; repeated failures move to a dead-letter queue." },
    description: "A separate queue for messages that repeatedly fail processing. CloudReaper keeps failed notifications here so they can be investigated rather than silently lost.",
  },
  {
    title: "AWS Secrets Manager",
    aliases: ["AWS Secrets Manager"],
    image: { src: "/technical-terms/secrets-manager.svg", alt: "AWS Secrets Manager service icon." },
    description: "Stores sensitive credentials outside application code. CloudReaper uses it to hold the Slack bot credentials needed to deliver alerts.",
  },
  {
    title: "Terraform",
    aliases: ["Terraform"],
    image: { src: "/technical-terms/terraform.svg", alt: "Infrastructure configuration is applied to create and manage resources." },
    description: "An infrastructure-as-code tool: configuration files describe the resources to create. CloudReaper uses it alongside Floci for local integration testing.",
  },
  {
    title: "gRPC",
    aliases: ["gRPC"],
    image: { src: "/technical-terms/grpc.png", alt: "gRPC logo." },
    description: "A framework for services to call each other's functions over a network. PallasDB uses it for database requests, including streaming a range of results.",
  },
  {
    title: "Raft consensus",
    aliases: ["HashiCorp Raft", "Raft"],
    image: { src: "/technical-terms/raft.svg", alt: "A leader replicates its log to followers; a majority agrees on a committed entry." },
    description: "An algorithm that lets servers agree on an ordered sequence of changes. PallasDB uses a leader and replicated log to keep cluster writes consistent.",
  },
  {
    title: "Write-ahead log",
    aliases: ["write-ahead log"],
    image: { src: "/technical-terms/write-ahead-log.svg", alt: "A change is recorded in a log before database files are updated, allowing crash recovery." },
    description: "Records changes on disk before they are acknowledged as committed. This gives the database a record it can replay to recover after a crash.",
  },
  {
    title: "fsync",
    aliases: ["fsync"],
    image: { src: "/technical-terms/fsync.svg", alt: "fsync transfers buffered file writes toward storage and waits for completion." },
    description: "An operating-system call that requests pending file writes be flushed to storage. PallasDB uses it before acknowledging committed log entries for crash safety.",
  },
  {
    title: "CRC32 checksum",
    aliases: ["CRC32"],
    image: { src: "/technical-terms/crc32.svg", alt: "Data bytes produce a 32-bit checksum that can be recomputed to detect corruption." },
    description: "A small value calculated from data to detect accidental corruption. PallasDB stores checksums with log records so damaged data can be detected.",
  },
  {
    title: "Memtable",
    aliases: ["memtable"],
    image: { src: "/technical-terms/memtable.svg", alt: "Recent writes enter a sorted table in RAM before being flushed to an SST file." },
    description: "A sorted in-memory buffer for recent database writes. PallasDB flushes it to persistent, sorted files as it fills up.",
  },
  {
    title: "SSTables",
    aliases: ["SSTables"],
    image: { src: "/technical-terms/sstables.svg", alt: "An index directs a key lookup to the matching sorted block in an immutable SSTable." },
    description: "Sorted String Tables: immutable files containing sorted keys and values. They let PallasDB persist data while supporting ordered reads and range scans.",
  },
  {
    title: "Compaction",
    aliases: ["compaction"],
    image: { src: "/technical-terms/compaction.svg", alt: "Sorted files merge into one, keeping current values and removing an obsolete version." },
    description: "Merges sorted storage files and removes obsolete versions. It helps keep database reads efficient as new files accumulate.",
  },
  {
    title: "Protocol Buffers",
    aliases: ["Protocol Buffers"],
    image: { src: "/technical-terms/protobuf.svg", alt: "Go serializes a message into bytes and Python parses it using a shared schema." },
    description: "A schema-based format for encoding structured messages. PallasDB uses it to define the requests and responses sent through its gRPC API.",
  },
  {
    title: "Serf gossip",
    aliases: ["Serf gossip"],
    image: { src: "/technical-terms/serf.svg", alt: "Membership updates spread from peer to peer in a gossip cluster." },
    description: "A cluster-membership tool that spreads node information between peers. PallasDB uses it to discover which servers belong to the cluster; Raft handles agreement on writes.",
  },
  {
    title: "Information Coefficient (IC)",
    aliases: ["Information Coefficient"],
    image: { src: "/technical-terms/information-coefficient.svg", alt: "Schematic positive correlation between predictions and future returns, not actual investment performance." },
    description: "A measure of how closely a model's predictions align with actual investment returns. Argus records it with each experiment so researchers can compare trading signals.",
  },
  {
    title: "Rank IC",
    aliases: ["Rank IC"],
    image: { src: "/technical-terms/rank-ic.svg", alt: "A toy example compares predicted and realized asset rankings, not actual investment results." },
    description: "A version of the Information Coefficient that compares rankings rather than raw values. It checks whether a model correctly orders investments by future performance.",
  },
  {
    title: "t-statistics",
    aliases: ["t-statistics"],
    image: { src: "/technical-terms/t-statistics.svg", alt: "A schematic effect three standard errors above zero illustrates a t-statistic of three." },
    description: "Measures that compare an estimated effect with its uncertainty. Researchers use them to assess how much evidence a trading signal has beyond random variation.",
  },
  {
    title: "Textual",
    aliases: ["Textual"],
    image: { src: "/technical-terms/textual.svg", alt: "Textual terminal UI framework logo." },
    description: "A Python framework for building interactive terminal applications. It provides Argus's interface for committing and reviewing experiment runs from the command line.",
  },
  {
    title: "SQLite",
    aliases: ["SQLite"],
    image: { src: "/technical-terms/sqlite.svg", alt: "SQLite database logo." },
    description: "A database embedded directly in an application, with no separate database server. Argus uses it to store experiment records locally.",
  },
  {
    title: "WebSocket",
    aliases: ["WebSocket", "WebSockets"],
    image: { src: "/technical-terms/websocket.svg", alt: "A browser and server exchange live messages over one open, two-way connection." },
    description: "A persistent two-way connection between a browser and a server. Digital Scorecards uses it to push dashboard updates without requiring a page refresh.",
  },
  {
    title: "Django",
    aliases: ["Django"],
    image: { src: "/technical-terms/django.svg", alt: "A web request reaches a Python backend that queries a database." },
    description: "A Python web framework for building backend applications. In Digital Scorecards, it calculates scores, aggregates results, and generates reports.",
  },
  {
    title: "PostgreSQL",
    aliases: ["PostgreSQL"],
    image: { src: "/technical-terms/postgresql.png", alt: "PostgreSQL blue elephant logo." },
    description: "A relational database that stores structured data and supports SQL queries. It is part of the backend infrastructure for Digital Scorecards.",
  },
  {
    title: "Memcached",
    aliases: ["Memcached"],
    image: { src: "/technical-terms/memcached.svg", alt: "Memcached classic M icon." },
    description: "An in-memory cache for frequently requested data. It helps reduce repeated backend work and database reads in applications such as Digital Scorecards.",
  },
];

const termsByAlias = new Map(
  technicalTerms.flatMap((term) =>
    term.aliases.map((alias) => [alias.toLowerCase(), term] as const)
  )
);
const termPattern = new RegExp(
  `\\b(${[...termsByAlias.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "gi"
);

type ExplainedText = string | { text: string; term: TechnicalTerm };

// Explain only the first mention per section; leave the original prose intact.
export function explainTechnicalTerms(text: string, seen: Set<string>): ExplainedText[] {
  const parts: ExplainedText[] = [];
  let offset = 0;

  for (const match of text.matchAll(termPattern)) {
    const term = termsByAlias.get(match[0].toLowerCase())!;
    if (seen.has(term.title)) continue;

    seen.add(term.title);
    parts.push(text.slice(offset, match.index), { text: match[0], term });
    offset = match.index + match[0].length;
  }

  parts.push(text.slice(offset));
  return parts;
}
