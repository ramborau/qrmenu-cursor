import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Create a custom adapter wrapper to fix field mapping
const baseAdapter = prismaAdapter(prisma, {
  provider: "postgresql",
});

// Wrap the adapter to map provider -> providerId in results
const fixedAdapter = (options: any) => {
  const adapter = baseAdapter(options);

  // Helper function to map account fields
  const mapAccountFields = (account: any) => {
    if (!account) return account;
    const mapped: any = { ...account };
    // Map provider -> providerId
    if (mapped.provider !== undefined && mapped.providerId === undefined) {
      mapped.providerId = mapped.provider;
    }
    // Map id -> accountId  
    if (mapped.id !== undefined && mapped.accountId === undefined) {
      mapped.accountId = mapped.id;
    }
    return mapped;
  };

  // Wrap findMany to map provider -> providerId in results
  const originalFindMany = adapter.findMany;
  if (originalFindMany) {
    adapter.findMany = async (params: any) => {
      const results = await originalFindMany(params);
      
      // Map provider -> providerId for account results
      if (params?.model === "account" && Array.isArray(results)) {
        const mapped = results.map(mapAccountFields);
        // Debug log
        if (mapped.length > 0) {
          console.log("[Auth Fix] Mapped accounts:", mapped.map((a: any) => ({
            id: a.id,
            provider: a.provider,
            providerId: a.providerId,
            hasPassword: !!a.password,
          })));
        }
        return mapped;
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
      if (params?.model === "account" && result) {
        return mapAccountFields(result);
      }
      
      return result;
    };
  }

  // Better Auth uses internalAdapter which might have findAccounts method
  // Wrap it if it exists to ensure field mapping
  if (adapter.findAccounts) {
    const originalFindAccounts = adapter.findAccounts;
    adapter.findAccounts = async (userId: string, trxAdapter?: any) => {
      const accounts = await originalFindAccounts(userId, trxAdapter);
      if (Array.isArray(accounts)) {
        return accounts.map(mapAccountFields);
      }
      return accounts;
    };
  }

  // Also check if adapter has internalAdapter property
  if (adapter.internalAdapter && adapter.internalAdapter.findAccounts) {
    const originalInternalFindAccounts = adapter.internalAdapter.findAccounts;
    adapter.internalAdapter.findAccounts = async (userId: string, trxAdapter?: any) => {
      const accounts = await originalInternalFindAccounts(userId, trxAdapter);
      if (Array.isArray(accounts)) {
        return accounts.map(mapAccountFields);
      }
      return accounts;
    };
  }

  return adapter;
};

export const auth = betterAuth({
  database: fixedAdapter,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3006",
    process.env.BETTER_AUTH_URL || "http://localhost:3006",
  ],
  baseURL: process.env.APP_URL || "http://localhost:3006",
  basePath: "/api/auth",
});

export type Session = typeof auth.$Infer.Session;
