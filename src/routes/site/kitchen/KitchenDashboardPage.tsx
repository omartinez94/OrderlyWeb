import { KdsTicketGrid } from "../../../features/kitchen/components/KdsTicketGrid";
import { useGetKitchenQueueQuery } from "../../../app/api/kitchen";

export function KitchenDashboardPage() {
  const { data: queueResponse, isLoading } = useGetKitchenQueueQuery();
  const tickets = queueResponse?.data ?? [];

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6">
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
