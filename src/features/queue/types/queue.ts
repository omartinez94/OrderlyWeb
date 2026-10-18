import type { QueuePartyDto, QueuePartyStatus } from "../../../types/catalog";

export type { QueuePartyDto, QueuePartyStatus };

export interface AddWalkInFormData {
  guestName: string;
  partySize: number;
  phone: string;
  quotedWaitMinutes: number;
}
