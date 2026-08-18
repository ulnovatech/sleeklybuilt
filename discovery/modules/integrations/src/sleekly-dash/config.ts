import { platformSettings } from '@agency/settings';

export type SleeklyDashConfig = {
  baseUrl: string;
  serviceToken: string;
};

/** Returns null when bridge is not configured — callers must stop (no mocks). */
export async function getSleeklyDashConfig(): Promise<SleeklyDashConfig | null> {
  await platformSettings.ensureLoaded();
  const baseUrl = platformSettings.getCredential('sleekly_dash_base_url')?.trim().replace(/\/+$/, '');
  const serviceToken = platformSettings.getCredential('sleekly_dash_service_token')?.trim();
  if (!baseUrl || !serviceToken) return null;
  return { baseUrl, serviceToken };
}

export async function isSleeklyDashConfigured(): Promise<boolean> {
  return (await getSleeklyDashConfig()) != null;
}
