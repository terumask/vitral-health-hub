import { Activity } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="p-6 rounded-full bg-muted/50 mb-6">
        <Activity className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        No Data Yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md">
        Your health metrics will appear here once data is synchronized from your wearable device.
      </p>
    </div>
  );
}
