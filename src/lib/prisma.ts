import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Re-instantiate if new models were added
if (
  globalForPrisma.prisma &&
  (!(globalForPrisma.prisma as any).siteSetting ||
    !(globalForPrisma.prisma as any).inquiryLead ||
    !(globalForPrisma.prisma as any).user ||
    !(globalForPrisma.prisma as any).personalityQuestion ||
    !(globalForPrisma.prisma as any).personalityTestInfo ||
    !(globalForPrisma.prisma as any).personalityTabResult)
) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
