import { catApiBase, type CatViewedPlan } from "./catApi";

interface PublishedEntry {
  id?: string;
  rosterId?: string;
  name?: string;
  englishName?: string;
  submittedAt?: string;
  major?: string | null;
  feStream?: string | null;
  plan?: unknown;
}

interface PublishedFile {
  plans?: PublishedEntry[];
}

function publishedUrls(date: string): string[] {
  const file = `study-plans/${encodeURIComponent(date)}.json`;
  const urls = [`https://kwtsang101016.github.io/dda1000/calendar/${file}`];
  if (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    urls.unshift(`http://127.0.0.1:5179/${file}`);
  }
  return urls;
}

function toViewed(entry: PublishedEntry, personKey: string): CatViewedPlan {
  return {
    personId: entry.rosterId || entry.id || personKey,
    name: entry.name ?? personKey,
    englishName: entry.englishName ?? "",
    submittedAt: entry.submittedAt ?? new Date().toISOString(),
    major: entry.major ?? null,
    feStream: entry.feStream ?? null,
    plan: entry.plan,
  };
}

async function fromPublishedFile(date: string, person: string, roster: string | null): Promise<CatViewedPlan | null> {
  for (const url of publishedUrls(date)) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = (await response.json()) as PublishedFile;
      const plans = Array.isArray(data.plans) ? data.plans : [];
      const entry = plans.find(
        (plan) => plan.id === person || plan.rosterId === person || (roster !== null && plan.rosterId === roster),
      );
      if (entry?.plan) return toViewed(entry, person);
    } catch {
      // Try the next copy. GitHub Pages is the durable one; local calendar is for development.
    }
  }
  return null;
}

async function fromCat(rosterId: string): Promise<CatViewedPlan | null> {
  try {
    const response = await fetch(`${catApiBase()}/api/study-plans/shared/${encodeURIComponent(rosterId)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as CatViewedPlan & { ok?: boolean; personId?: string };
    if (payload.ok === false || payload.plan == null) return null;
    return {
      personId: payload.personId,
      name: payload.name,
      englishName: payload.englishName ?? "",
      submittedAt: payload.submittedAt,
      major: payload.major ?? null,
      feStream: payload.feStream ?? null,
      plan: payload.plan,
    };
  } catch {
    return null;
  }
}

/** Load the plan linked from the course calendar. */
export async function fetchPublishedStudyPlan(
  date: string,
  person: string,
  roster: string | null,
): Promise<CatViewedPlan> {
  const published = await fromPublishedFile(date, person, roster);
  if (published) return published;
  if (roster) {
    const live = await fromCat(roster);
    if (live) return live;
  }
  throw new Error("No submitted study plan is available for this name card yet.");
}
