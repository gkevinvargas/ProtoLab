<<<<<<< HEAD
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/labs/Header";
//import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import primeraClase from "@/lib/datalab/DL-CT-01.json";
import segundaClase from "@/lib/datalab/DL-CT-02.json";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";
import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";

const clasesDataLab = [primeraClase, segundaClase];

export default function DataLabPage2() {
    return (
        <RequireConfirmedRoute>
            <RecorridoTeorico clases={clasesDataLab}>
                <DataLabOverview />
            </RecorridoTeorico>
        </RequireConfirmedRoute>
        
    )
}
=======
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
>>>>>>> 45dbbaaef0157e135edd2829050b3ab83d05b7ad
