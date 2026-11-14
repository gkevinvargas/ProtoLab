<<<<<<< HEAD
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/labs/Header";
//import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import primeraClase from "@/lib/datalab/DL-CT-01.json";
import segundaClase from "@/lib/datalab/DL-CT-02.json";

const clasesDataLab = [primeraClase, segundaClase];

export default function DataLabPage2() {
    return (

        <DataLabOverview />
        
    )
=======

import { DataLabOverview2 } from "@/components/datalab/datalab-overview2";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

export default function DataLabPage() {
  return (
    <RequireConfirmedRoute>
      <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">
        <DataLabOverview2 />
      </div>
    </RequireConfirmedRoute>
  );
>>>>>>> c691a09073efe4f7493a17bd2e741904bb7063d6
}
