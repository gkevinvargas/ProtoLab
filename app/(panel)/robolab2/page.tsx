
"use client";

import RoboLabScreen2 from "@/components/robolab/robolab-screen";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

export default function RoboLabPage() {
  return (
    <RequireConfirmedRoute>
      <RoboLabScreen2 />
    </RequireConfirmedRoute>
  );
}
