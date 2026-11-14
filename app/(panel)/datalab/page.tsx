// app/(panel)/datalab/page.tsx
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";
import primeraClase from "@/lib/datalab/DL-CT-01.json";
import segundaClase from "@/lib/datalab/DL-CT-02.json";

const clasesDataLab = [primeraClase, segundaClase];

export default function DataLabPage() {
  return (
    <RequireConfirmedRoute>
      <RecorridoTeorico clases={clasesDataLab}>
        <DataLabOverview />
      </RecorridoTeorico>
    </RequireConfirmedRoute>
  );
}