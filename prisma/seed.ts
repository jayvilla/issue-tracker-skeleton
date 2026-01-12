import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed your database here
  // Example: Create some sample issues
  const issues = [
    {
      title: "Fix login bug",
      description: "Users are unable to log in with their credentials",
      status: "OPEN" as const,
    },
    {
      title: "Add dark mode",
      description: "Implement dark mode theme for the application",
      status: "IN_PROGRESS" as const,
    },
    {
      title: "Update documentation",
      description: "Update README with latest setup instructions",
      status: "DONE" as const,
    },
  ];

  // Clear existing issues (optional - comment out if you want to keep existing data)
  // await prisma.issue.deleteMany();

  // Create issues
  await prisma.issue.createMany({
    data: issues,
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
