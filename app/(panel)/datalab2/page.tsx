import { DataLabOverview } from "@/components/datalab/datalab-overview";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/labs/Header";
//import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import primeraClase from "@/lib/datalab/DL-CT-01.json";
import segundaClase from "@/lib/datalab/DL-CT-02.json";
import { DataLabOverview2 } from "@/components/datalab/datalab-overview2";

const clasesDataLab = [primeraClase, segundaClase];

export default function DataLabPage2() {
    return (

        <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">

            {/* CONTENIDO PRINCIPAL */}
            <DataLabOverview2 />

        </div>
    )
}


