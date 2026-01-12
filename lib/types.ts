// Type definition matching the Prisma IssueStatus enum
// This allows TypeScript to compile before running `prisma generate`
// Once Prisma client is generated, you can optionally switch to importing from @prisma/client

export enum IssueStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}