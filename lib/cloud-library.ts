// Shared global story library backed by Upstash Redis.
//
// Schema:
//   ZSET  stories:index            score = createdAt, member = id
//   HASH  story:{id}               { title, paragraphs (JSON), imageUrl, storyPrompt, createdAt }
//
// Reads are O(log n + k) for the index range scan plus k hash lookups.
// At ~100 stories/day this stays well inside Upstash's free tier
// (10k commands/day, 256 MB storage).
//
// If UPSTASH_REDIS_REST_URL isn't configured the helpers all return
// null/empty so the API routes can fall back gracefully.

import { Redis } from "@upstash/redis";

export type CloudStory = {
  id: string;
  title: string;
  paragraphs: string[];
  imageUrl: string | null;
  imagePrompt: string;
  storyPrompt: string;
  createdAt: number;
};

const INDEX_KEY = "stories:index";
const HASH_PREFIX = "story:";

let cached: Redis | null = null;

export function getRedis(): Redis | null {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cached = new Redis({ url, token });
  return cached;
}

export function isCloudConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function newCloudStoryId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveCloudStory(story: CloudStory): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Cloud library not configured");
  await redis.hset(HASH_PREFIX + story.id, {
    title: story.title,
    paragraphs: JSON.stringify(story.paragraphs),
    imageUrl: story.imageUrl ?? "",
    imagePrompt: story.imagePrompt ?? "",
    storyPrompt: story.storyPrompt ?? "",
    createdAt: String(story.createdAt),
  });
  await redis.zadd(INDEX_KEY, { score: story.createdAt, member: story.id });
}

export async function listCloudStories(limit = 50): Promise<CloudStory[]> {
  const redis = getRedis();
  if (!redis) return [];
  // ZRANGE with REV pulls newest-first using a reverse range scan.
  const ids = (await redis.zrange<string[]>(INDEX_KEY, 0, limit - 1, {
    rev: true,
  })) as string[];
  if (!ids.length) return [];
  // Pipeline the HGETALL fan-out so we issue one round-trip instead
  // of N. Upstash REST counts pipelines as 1 command for billing too.
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.hgetall(HASH_PREFIX + id);
  const rows = (await pipeline.exec()) as Array<Record<string, string> | null>;

  const stories: CloudStory[] = [];
  ids.forEach((id, i) => {
    const r = rows[i];
    if (!r || !r.title) return;
    let paragraphs: string[] = [];
    try {
      paragraphs = JSON.parse(r.paragraphs ?? "[]");
    } catch {
      paragraphs = [];
    }
    stories.push({
      id,
      title: r.title,
      paragraphs,
      imageUrl: r.imageUrl || null,
      imagePrompt: r.imagePrompt ?? "",
      storyPrompt: r.storyPrompt ?? "",
      createdAt: Number(r.createdAt) || 0,
    });
  });
  return stories;
}

export async function getCloudStory(id: string): Promise<CloudStory | null> {
  const redis = getRedis();
  if (!redis) return null;
  const r = (await redis.hgetall(HASH_PREFIX + id)) as Record<string, string> | null;
  if (!r || !r.title) return null;
  let paragraphs: string[] = [];
  try {
    paragraphs = JSON.parse(r.paragraphs ?? "[]");
  } catch {
    paragraphs = [];
  }
  return {
    id,
    title: r.title,
    paragraphs,
    imageUrl: r.imageUrl || null,
    imagePrompt: r.imagePrompt ?? "",
    storyPrompt: r.storyPrompt ?? "",
    createdAt: Number(r.createdAt) || 0,
  };
}
