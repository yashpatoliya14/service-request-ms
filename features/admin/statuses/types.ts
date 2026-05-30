export interface StatusItem {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  Sequence: number | null;
  Description: string | null;
  ServiceRequestStatusCssClass: string | null;
  IsAllowedForTechnician: boolean | null;
  IsDefault: boolean | null;
  IsAssigned: boolean | null;
  IsTerminal: boolean | null;
  Created: string;
}
