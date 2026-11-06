export const projectTermImages = {
  "cloudreaper-alerts": [
    "ec2.svg", "cli.svg", "cloudformation.svg", "eventbridge.svg", "lambda.svg",
    "cloudtrail.svg", "sqs.svg", "dead-letter-queue.svg", "secrets-manager.svg", "terraform.svg",
  ],
  pallasdb: [
    "grpc.png", "raft.svg", "write-ahead-log.svg", "fsync.svg", "crc32.svg",
    "memtable.svg", "sstables.svg", "compaction.svg", "protobuf.svg", "serf.svg",
  ],
  argus: [
    "information-coefficient.svg", "rank-ic.svg", "t-statistics.svg", "textual.svg", "sqlite.svg",
  ],
  "digital-scorecards": ["websocket.svg", "django.svg", "postgresql.png", "memcached.svg"],
} as const;

export const termImagePaths = (slug: keyof typeof projectTermImages) =>
  projectTermImages[slug].map((file) => `/technical-terms/${file}`);
