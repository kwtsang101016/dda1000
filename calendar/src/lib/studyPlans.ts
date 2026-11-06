export interface PublishedStudyPlan {
  /** Id used on the calendar attendance board, e.g. student-19 */
  id: string;
  /** Roster id used by CAT, e.g. stu-19 */
  rosterId: string;
  name: string;
  englishName: string;
  submittedAt: string;
  major: string | null;
  feStream: string | null;
  plan: unknown;
}

interface PublishedFile {
  plans?: PublishedStudyPlan[];
}

export async function fetchPublishedStudyPlans(file: string): Promise<PublishedStudyPlan[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}study-plans/${file}`);
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as PublishedFile;
  return Array.isArray(data.plans) ? data.plans : [];
}

/** Opens the study planner on the same plan CAT shows from a name card. */
export function studyPlannerUrl(date: string, plan: PublishedStudyPlan): string {
  const base = import.meta.env.DEV
    ? "http://127.0.0.1:5190/"
    : "https://kwtsang101016.github.io/dda1000/study_planner/";
  const url = new URL(base);
  url.searchParams.set("planDate", date);
  url.searchParams.set("person", plan.id);
  url.searchParams.set("roster", plan.rosterId);
  return url.toString();
}
