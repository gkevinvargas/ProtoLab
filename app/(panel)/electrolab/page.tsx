
import ElectroLabScreen from "@/components/electrolab/electrolab-screen";
import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

import fundamentosLed from "@/lib/electrolab/clases/EL-CT-01-fundamentos-led.json";
import conexionSerieLed from "@/lib/electrolab/clases/EL-CT-02-conexion-serie-led.json";
import leyOhmLed from "@/lib/electrolab/clases/EL-CT-03-ley-ohm-resistencia-led.json";

<<<<<<< HEAD
const clasesElectroLab = [fundamentosLed, conexionSerieLed, leyOhmLed];
=======
const clasesElectroLab = [
  fundamentosLed,
  conexionSerieLed,
  leyOhmLed,
] as unknown as readonly any[];
>>>>>>> efe3b6a3e45275037fc9d0c6529c182141636341

export default function ElectroLabPage() {
  return (
    <RequireConfirmedRoute>
      <RecorridoTeorico clases={clasesElectroLab}>
        <ElectroLabScreen />
      </RecorridoTeorico>
    </RequireConfirmedRoute>
  );
}
