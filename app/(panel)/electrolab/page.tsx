
import ElectroLabScreen from "@/components/electrolab/electrolab-screen";
import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import RequireConfirmedRoute from "@/components/diagnostico/RequireConfirmedRoute";

import fundamentosLed from "@/lib/electrolab/clases/EL-CT-01-fundamentos-led.json";
import conexionSerieLed from "@/lib/electrolab/clases/EL-CT-02-conexion-serie-led.json";
import leyOhmLed from "@/lib/electrolab/clases/EL-CT-03-ley-ohm-resistencia-led.json";

const clasesElectroLab = [fundamentosLed, conexionSerieLed, leyOhmLed];

export default function ElectroLabPage() {
  return (
    <RequireConfirmedRoute>
      <RecorridoTeorico clases={clasesElectroLab}>
        <ElectroLabScreen />
      </RecorridoTeorico>
    </RequireConfirmedRoute>
  );
}
