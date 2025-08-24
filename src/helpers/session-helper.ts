export const sessionHistories: Map<string, any[]> = new Map();

export const addToSessionHistory = (
  sessionId: string,
  role: "user" | "model" | "function",
  parts: any
) => {
  if (!sessionHistories.has(sessionId)) {
    sessionHistories.set(sessionId, []);
  }

  const history = sessionHistories.get(sessionId);
  history?.push({
    role,
    parts: Array.isArray(parts) ? parts : [parts],
  });
};

export const getSessionHistory = (sessionId: string): any[] => {
  return sessionHistories.get(sessionId) || [];
};
