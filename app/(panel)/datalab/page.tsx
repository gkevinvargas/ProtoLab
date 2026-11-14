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
