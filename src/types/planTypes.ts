export interface Plan {
  id: string;
  title: string;
  description: string;
  html_link: string;
  start: string | undefined;
  end: string | undefined;
  all_day: boolean;
  background_color?: string | null;
  calendar_id: string;
  editable: boolean;
}

export interface CalendarPlan {
  background_color?: string | null;
  foreground_color?: string | null;
  summary?: string | null;
  id: string;
  events: Plan[];
}

//GET /plan/all
export type GetPlanAllQuery = {
  date: string;
};

//PATCH /plan/:plan_id
export type PatchPlanParams = {
  plan_id: string;
};

//PATCH /plan/:plan_id
export type PatchPlanBody = {
  plan: Plan;
};

//DELETE /plan/:plan_id
export type DeletePlanParams = {
  plan_id: string;
};

//DELETE /plan/:plan_id
export type DeletePlanBody = {
  calendar_id: string;
};

//PUT /plan
export type PutPlanBody = {
  plan: Omit<Plan, 'id'>;
};
