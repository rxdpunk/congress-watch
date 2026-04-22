const CONGRESS_GOV_API_BASE = "https://api.congress.gov/v3";

export class CongressGovApiError extends Error {}

export function hasCongressGovApiKey(): boolean {
  return Boolean(process.env.CONGRESS_GOV_API_KEY);
}

export async function fetchCongressGov<T>(
  path: string,
  init?: RequestInit,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const apiKey = process.env.CONGRESS_GOV_API_KEY;
  if (!apiKey) {
    throw new CongressGovApiError("CONGRESS_GOV_API_KEY is not configured");
  }

  const url = new URL(`${CONGRESS_GOV_API_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");

  const response = await fetchImpl(url, init);
  if (!response.ok) {
    throw new CongressGovApiError(`Congress.gov request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchCurrentCongressBills(fetchImpl: typeof fetch = fetch) {
  return fetchCongressGov("/bill/119", undefined, fetchImpl);
}
