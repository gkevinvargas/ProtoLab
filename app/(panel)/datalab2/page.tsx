
import { DataLabOverview2 } from "@/components/datalab/datalab-overview2";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

export default function DataLabPage2() {
  return (
    <RequireConfirmedRoute>
      <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">
        <DataLabOverview2 />
      </div>
    </RequireConfirmedRoute>
  );
}
