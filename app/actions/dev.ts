"use server";

import { revalidatePath } from "next/cache";
import { clearSessionCookie } from "@/lib/session";
import { setDevFlag, getDevFlags, resetAllMockData } from "@/lib/api";

export async function toggleDevFlagAction(
  flag:
    | "slowNetwork"
    | "failNextRequest"
    | "forceEmptyState"
    | "forceStreamError",
  value: boolean,
) {
  await setDevFlag(flag, value);
  revalidatePath("/", "layout");
  return await getDevFlags();
}

export async function expireSessionAction() {
  await clearSessionCookie();
  return { expired: true };
}

export async function resetMockDataAction() {
  await resetAllMockData();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getDevFlagsAction() {
  return await getDevFlags();
}
