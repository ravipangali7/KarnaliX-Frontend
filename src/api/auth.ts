import { apiGet } from "@/lib/api";
import type { User } from "@/contexts/AuthContext";

export async function getMe(): Promise<User> {
  const res = await apiGet<User>("/public/auth/me/");
  return res as unknown as User;
}
