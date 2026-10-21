import { QueuePartyStatus, type QueuePartyDto } from "../../../types/catalog";

export { QueuePartyStatus };
export type { QueuePartyDto };

export interface AddWalkInFormData {
  guestName: string;
  partySize: number;
  phone: string;
  quotedWaitMinutes: number;
}
