import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Fetch and process FEED stories every 3 hours
crons.interval(
  "sync-latest-feed",
  { hours: 3 },
  api.feedSync.fetchAndProcessFeed,
);

export default crons;
