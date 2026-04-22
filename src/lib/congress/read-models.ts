import type { HomeReadModel, MemberReadModel, StateReadModel } from "@/lib/congress/domain";
import { deriveHomeReadModel, deriveMemberReadModel, deriveStateReadModel } from "@/lib/congress/derive";
import { getCongressDataset } from "@/lib/congress/repository";

export async function getHomeReadModel(): Promise<HomeReadModel> {
  const dataset = await getCongressDataset();
  return deriveHomeReadModel(dataset);
}

export async function getStateReadModel(stateCode: string): Promise<StateReadModel | null> {
  const dataset = await getCongressDataset();
  return deriveStateReadModel(dataset, stateCode);
}

export async function getMemberReadModel(slug: string): Promise<MemberReadModel | null> {
  const dataset = await getCongressDataset({ enrichHouseProfiles: true });
  return deriveMemberReadModel(dataset, slug);
}
