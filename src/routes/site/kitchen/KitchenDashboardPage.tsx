import { KdsTicketGrid } from "../../../features/kitchen/components/KdsTicketGrid";
import { useGetKitchenQueueQuery } from "../../../app/api/kitchen";

export function KitchenDashboardPage() {
  const { data: queueResponse, isLoading } = useGetKitchenQueueQuery();
  const tickets = queueResponse?.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <h1 className="font-display text-ink text-3xl font-bold">Order queue</h1>
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <p className="text-ink-muted animate-pulse font-mono text-sm">
            Loading active tickets...
          </p>
        </div>
      ) : (
        <KdsTicketGrid tickets={tickets} />
      )}
    </div>
  );
}

export default KitchenDashboardPage;
