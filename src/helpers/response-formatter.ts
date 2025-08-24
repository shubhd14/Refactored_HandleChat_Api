
export interface FormatResponseOptions {
  title: string;
  response: unknown;
  next_user_responses?: string[];
  crm_action?: unknown;
  tracing_filters?: unknown;
}

export function formatResponse({
  title,
  response,
  next_user_responses = [],
  crm_action = null,
  tracing_filters = null,
}: FormatResponseOptions) {
  const timestamp = new Date().toISOString();

  return {
    title,
    response,
    next_user_responses,
    timestamp,
    crm_action,
    tracing_filters,
  };
}
