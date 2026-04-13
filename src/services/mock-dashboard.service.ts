import { MOCK_ACTIVITIES, MOCK_STAT_CARDS, MOCK_USER_GROWTH } from "@/lib/mock";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 看板 MOCK：模拟网络延迟，便于展示骨架屏 */
export async function fetchDashboardStats() {
  await delay(600);
  return MOCK_STAT_CARDS;
}

export async function fetchUserGrowthSeries() {
  await delay(500);
  return MOCK_USER_GROWTH;
}

export async function fetchRecentActivities() {
  await delay(400);
  return MOCK_ACTIVITIES;
}
