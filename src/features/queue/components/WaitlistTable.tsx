import { differenceInMinutes, parseISO } from "date-fns";
import { Bell, Armchair, UserX, Clock, Users, Phone } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { QueuePartyDto } from "../types/queue";

export interface WaitlistTableProps {
  queue: QueuePartyDto[];
  onNotify: (party: QueuePartyDto) => void;
  onSeat: (party: QueuePartyDto) => void;
  onCancel: (party: QueuePartyDto) => void;
  isUpdating?: boolean;
}

export function WaitlistTable({
  queue,
  onNotify,
  onSeat,
  onCancel,
  isUpdating = false,
}: WaitlistTableProps) {
  const getStatusBadge = (status: QueuePartyDto["status"]) => {
    switch (status) {
      case "waiting":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
          >
            <Clock className="size-3" />
            Waiting
          </Badge>
        );
      case "notified":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-sky-500/40 bg-sky-500/10 text-[11px] font-semibold text-sky-700 dark:text-sky-400"
          >
            <Bell className="size-3" />
            SMS Notified
          </Badge>
        );
      case "seated":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <Armchair className="size-3" />
            Seated
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-slate-500/40 bg-slate-500/10 text-[11px] font-semibold text-slate-600 dark:text-slate-400"
          >
            <UserX className="size-3" />
            No Show
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateElapsed = (createdAt: string) => {
    try {
      const date = parseISO(createdAt);
      const minutes = differenceInMinutes(new Date(), date);
      return `${minutes} min ago`;
    } catch {
      return "just now";
    }
  };

  return (
    <div className="border-border/60 bg-surface overflow-hidden rounded-lg border shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
            <TableHead className="text-xs font-bold">Guest & Party</TableHead>
            <TableHead className="text-xs font-bold">Contact</TableHead>
            <TableHead className="text-xs font-bold">Quoted / Elapsed</TableHead>
            <TableHead className="text-xs font-bold">Status</TableHead>
            <TableHead className="text-right text-xs font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {queue.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-ink-subtle h-32 text-center text-xs">
                The walk-in queue is currently empty.
              </TableCell>
            </TableRow>
          ) : (
            queue.map((party, index) => {
              const isActive = party.status === "waiting" || party.status === "notified";

              return (
                <TableRow
                  key={party.id}
                  data-testid={`queue-row-${party.id}`}
                  className={cn(
                    "border-border/40 transition-colors",
                    !isActive && "opacity-60 bg-surface-elevated/30",
                  )}
                >
                  {/* Position */}
                  <TableCell className="text-ink text-center font-mono text-xs font-bold">
                    {index + 1}
                  </TableCell>

                  {/* Guest Name & Party Size */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-display text-ink text-sm font-semibold">
                        {party.guestName}
                      </span>
                      <div className="text-ink-subtle flex items-center gap-1 text-xs">
                        <Users className="size-3" />
                        <span>
                          Party of <strong className="text-ink font-mono">{party.partySize}</strong>
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <div className="text-ink-subtle flex items-center gap-1.5 font-mono text-xs">
                      <Phone className="size-3" />
                      <span>{party.phone}</span>
                    </div>
                  </TableCell>

                  {/* Quoted vs Elapsed */}
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="text-ink font-semibold">
                        Quoted: <strong className="font-mono">{party.quotedWaitMinutes} min</strong>
                      </span>
                      <span className="text-ink-subtle text-[11px]">
                        Waited: {calculateElapsed(party.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(party.status)}</TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isActive && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => onNotify(party)}
                            aria-label={`Notify ${party.guestName}`}
                            className="gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                          >
                            <Bell className="size-3.5" />
                            <span className="hidden sm:inline">Notify</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            disabled={isUpdating}
                            onClick={() => onSeat(party)}
                            aria-label={`Seat ${party.guestName}`}
                            className="gap-1 text-xs font-semibold"
                          >
                            <Armchair className="size-3.5" />
                            <span>Seat</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isUpdating}
                            onClick={() => onCancel(party)}
                            aria-label={`Remove ${party.guestName}`}
                            className="text-ink-subtle hover:text-destructive size-8 p-0"
                          >
                            <UserX className="size-3.5" />
                          </Button>
                        </>
                      )}

                      {party.status === "seated" && party.allocatedTableNumber && (
                        <span className="text-ink-subtle font-mono text-xs font-semibold">
                          Table {party.allocatedTableNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
