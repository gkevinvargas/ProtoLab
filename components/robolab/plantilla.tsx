import { BannerPractica } from "../ui/labs/banner";
import { Header } from "../ui/labs/Header";
import { Sidebar } from "../ui/sidebar";



export default function Plantilla() {
    return (

                        <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">

                            <BannerPractica
                                            nombreLaboratorio='ElectroLab'
                                            nombrePractica={'Circuito libre'}
                                            nivelPractica={'Sin nivel'}
                                            descripcionPractica={'Construye un circuito agregando componentes al área de trabajo'}
                                        />
                            
                            {/* CONTENIDO PRINCIPAL */}

                        </div>
    )
}





