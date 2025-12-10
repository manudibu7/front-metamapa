import React from "react";
import { VictoryPie, VictoryTooltip } from "victory";
import "./estadisticaTorta.css";

// Función para normalizar nombres largos
const normalizarNombre = (nombre) => {
  if (!nombre) return "";

  if (nombre === "Ciudad Autonoma de Buenos Aires") return "CABA";
  if (nombre === "Buenos Aires") return "BsAs";

  return nombre;
};

export const EstadisticaTorta = ({ data }) => {
  return (
    <div className="estadistica-torta">
      <VictoryPie
        data={data.map((d) => ({
          ...d,
          x: normalizarNombre(d.x),
        }))} 
        innerRadius={60}
        padAngle={1.5}
        colorScale={data.map((item) => item.fill)}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        labelComponent={<VictoryTooltip />}
      />
    </div>
  );
};

export default EstadisticaTorta;
