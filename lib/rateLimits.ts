import { defineRateLimits } from "convex-helpers/server/rateLimit";

const SECOND = 1000; // ms
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const { checkRateLimit, rateLimit, resetRateLimit } = defineRateLimits({
  generateAudioAction: { kind: "fixed window", rate: 3, period: MINUTE * 2 },
  generateThumbnailAction: { kind: "fixed window", rate: 3, period: MINUTE * 2 },
  createPodcast: { kind: "fixed window", rate: 3, period: MINUTE * 2 },
  uploadFile: { kind: "fixed window", rate: 3, period: MINUTE * 2 },
  incrementPodcastViews: { kind: "fixed window", rate: 1, period: MINUTE * 2 },
});

// Format retry time to a more readable format
export function formatRetryTime(retryAt: number): string {
  const date = new Date(retryAt);
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata", // IST
  };
  return date.toLocaleTimeString("en-US", options);
}
