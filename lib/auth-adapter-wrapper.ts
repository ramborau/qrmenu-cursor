// Custom adapter wrapper to fix Better Auth field mapping issue
// Better Auth expects providerId but Prisma returns provider

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export function createFixedAdapter(config: { provider: "postgresql" }) {
  const baseAdapter = prismaAdapter(prisma, config);

  return (options: any) => {
    const adapter = baseAdapter(options);

    // Wrap findMany to map provider -> providerId in results
    const originalFindMany = adapter.findMany;
    if (originalFindMany) {
      adapter.findMany = async (params: any) => {
        const results = await originalFindMany(params);

        // Map provider -> providerId for account results
        if (params.model === "account" && Array.isArray(results)) {
          return results.map((account: any) => {
            if (account.provider !== undefined && account.providerId === undefined) {
              return {
                ...account,
                providerId: account.provider,
                accountId: account.id, // Also map id -> accountId if needed
              };
            }
            return account;
          });
        }

        return results;
      };
    }

    // Wrap findOne to map provider -> providerId in result
    const originalFindOne = adapter.findOne;
    if (originalFindOne) {
      adapter.findOne = async (params: any) => {
        const result = await originalFindOne(params);

        // Map provider -> providerId for account result
        if (params.model === "account" && result) {
          if (result.provider !== undefined && result.providerId === undefined) {
            return {
              ...result,
              providerId: result.provider,
              accountId: result.id, // Also map id -> accountId if needed
            };
          }
        }

        return result;
      };
    }

    return adapter;
  };
}

