import api from "@/api/axiosInstance";

export interface LogActivityParams {
  action: string;
  details: string;
  amount?: number;
  httpMethod?: string;
  endpoint?: string;
}

/**
 * Log a system activity action into the Activity Log audit trail.
 * Fire-and-forget helper to prevent blocking UI interactions.
 */
export async function logActivity({
  action,
  details,
  amount,
  httpMethod,
  endpoint,
}: LogActivityParams): Promise<void> {
  try {
    const payload = {
      action: action.toUpperCase(),
      details,
      amount: amount !== undefined && amount !== null ? Number(amount) : null,
      httpMethod: httpMethod ? httpMethod.toUpperCase() : undefined,
      endpoint,
    };

    try {
      await api.post("/activity-logs", payload);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        try {
          await api.post("/activity-log", payload);
        } catch {
          try {
            await api.post("/logs", payload);
          } catch {
            /* silent fallback */
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking catch so UI operation always completes cleanly
    console.debug("[ActivityLogger] Log recording failed silently:", err);
  }
}
