// Patch Better Auth's validation to handle provider field mapping
// Better Auth expects providerId but Prisma returns provider

export function patchAccountForValidation(account: any) {
  if (!account) return account;

  // Map provider -> providerId if needed
  if (account.provider !== undefined && account.providerId === undefined) {
    account.providerId = account.provider;
  }

  return account;
}

