import redis from "../redis";

export async function viewAnnouncement(userId: string) {
  const announcementKey = "announcement";
  const viewedSetKey = "announcement:viewed";

  // Check if announcement exists
  const announcement = await redis.get(announcementKey);
  if (!announcement) return null;

  // Check if user has already viewed the announcement
  const hasViewed = await redis.sismember(viewedSetKey, userId);
  if (hasViewed) return null;

  // Mark as viewed
  await redis.sadd(viewedSetKey, userId);

  return JSON.parse(announcement); // assuming it's stored as JSON
}

export async function getAnnouncement() {
  const announcementKey = "announcement";
  const announcement = await redis.get(announcementKey);
  if (!announcement) return null;
  return announcement;
}

export async function countAnnouncementViews(): Promise<number> {
  return await redis.scard("announcement:viewed");
}

export async function hasUserViewedAnnouncement(
  userId: string
): Promise<boolean> {
  return await redis
    .sismember("announcement:viewed", userId)
    .then((res) => res === 1);
}
