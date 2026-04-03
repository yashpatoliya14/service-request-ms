import { Badge } from "@/components/ui/badge";

// Common status type used across the app
export interface StatusInfo {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  ServiceRequestStatusCssClass: string;
  IsTerminal?: boolean | null;
  IsDefault?: boolean | null;
  IsAssigned?: boolean | null;
  IsAllowedForTechnician?: boolean | null;
}

// Minimal request shape needed for getStatusBadge
export interface StatusableRequest {
  StatusID: string | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    ServiceRequestStatusCssClass: string;
    IsTerminal?: boolean | null;
    IsDefault?: boolean | null;
    IsAssigned?: boolean | null;
  } | null;
}

/**
 * Returns the status name for a given StatusID, looking it up from the statuses array.
 * Falls back to "Pending" if not found.
 */
export const getStatusLabel = (statusId: string | null, statuses: StatusInfo[]): string => {
  if (!statusId) return "Pending";
  const status = statuses.find(s => s.ServiceRequestStatusID === Number(statusId));
  return status?.ServiceRequestStatusName ?? "Pending";
};

/**
 * Returns the CSS class for a given StatusID.
 * Falls back to a neutral slate style if not found.
 */
export const getStatusClass = (statusId: string | null, statuses: StatusInfo[]): string => {
  if (!statusId) return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  const status = statuses.find(s => s.ServiceRequestStatusID === Number(statusId));
  return status?.ServiceRequestStatusCssClass ?? "bg-slate-100 text-slate-700 hover:bg-slate-100";
};

/**
 * Returns a Badge component with the correct CSS class and status label.
 * Uses embedded ServiceRequestStatus from the request if available, otherwise looks up by StatusID.
 */
export const getStatusBadge = (req: StatusableRequest, statuses: StatusInfo[]) => {
  const cssClass = req.ServiceRequestStatus?.ServiceRequestStatusCssClass || getStatusClass(req.StatusID, statuses);
  const label = req.ServiceRequestStatus?.ServiceRequestStatusName || getStatusLabel(req.StatusID, statuses);
  return <Badge className={cssClass}>{label}</Badge>;
};
