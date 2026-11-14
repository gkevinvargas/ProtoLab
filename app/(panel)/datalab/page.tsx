// app/(panel)/datalab/page.tsx
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

export default function DataLabPage() {
  return (
    <RequireConfirmedRoute>
      <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">
        <DataLabOverview />
      </div>
    </RequireConfirmedRoute>
  );
}