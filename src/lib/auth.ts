import { ManagementClient } from "auth0";

let managementClient: ManagementClient | null = null;

export function getManagementClient(): ManagementClient | null {
  if (managementClient) return managementClient;

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    return null;
  }

  managementClient = new ManagementClient({
    domain,
    clientId,
    clientSecret,
  });

  return managementClient;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const client = getManagementClient();
  if (!client) return ["Default User"];

  try {
    const roles = await client.users.getRoles({ id: userId });
    return roles.data.map((r: { name: string }) => r.name);
  } catch {
    return ["Default User"];
  }
}
