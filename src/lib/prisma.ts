import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient();
}

let client: PrismaClient = globalForPrisma.prisma ?? createClient();

/** After `prisma generate`, a cached PrismaClient from before the Dictionary model existed may still sit on globalThis; rebuild the client in dev. */
if (process.env.NODE_ENV === "development") {
  if (typeof (client as unknown as { dictionary?: unknown }).dictionary === "undefined") {
    void client.$disconnect().catch(() => {});
    client = createClient();
  }
}

export const prisma = client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Call before using `prisma.dictionary`. If the delegate is still missing, the client
 * was generated without the Dictionary model or Node is serving a stale `@prisma/client` — run
 * `npx prisma generate` and restart the dev server.
 */
export function assertPrismaClientReady(): void {
  if (typeof (prisma as unknown as { dictionary?: unknown }).dictionary === "undefined") {
    throw new Error(
      "Prisma Client is missing the Dictionary model. Run `npx prisma generate` at the project root, then restart the dev server (delete `.next` if the error persists). " +
        "With Docker, run generate inside the app image or use `make install` so `node_modules` matches `prisma/schema.prisma`."
    );
  }
}
