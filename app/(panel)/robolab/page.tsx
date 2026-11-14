"use client";

import RoboLabScreen from "@/components/robolab/robolab-screen";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

export default function RoboLabPage() {
  return (
    <RequireConfirmedRoute>
      <RoboLabScreen />
    </RequireConfirmedRoute>
  );
}
