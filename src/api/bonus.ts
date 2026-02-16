import { apiGet } from "@/lib/api";

export interface BonusRule {
  id: number;
  name: string;
  bonus_type: string;
  reward_type: string;
  reward_value: string;
  min_deposit?: string;
  roll_required?: string;
  is_active?: boolean;
  created_at?: string;
}

export async function getBonusRules(): Promise<BonusRule[]> {
  const res = await apiGet<BonusRule[]>("/public/bonus-rules/");
  return (res as unknown as BonusRule[]) ?? [];
}
