import { VictoryChart, VictoryAxis, VictoryBar, VictoryTheme } from "victory";
import "./estadisticaBarra.css";

// Normaliza nombres largos
const normalizarNombre = (nombre) => {
  if (!nombre) return "";

  if (nombre === "Ciudad Autonoma de Buenos Aires") return "CABA";
  if (nombre === "Buenos Aires") return "BsAs";

  return nombre;
};

const EstadisticaBarra = ({ data }) => {
  const dataNormalizada = data.map((d) => ({
    ...d,
    x: normalizarNombre(d.x),
  }));

  return (
    <div className="estadistica-barra">
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={15}
        height={260}
        padding={{ top: 16, bottom: 60, left: 60, right: 24 }}
      >
        <VictoryAxis
          style={{
            tickLabels: { 
              fontSize: 10,
              fill: "var (--color-text, #4b5563)", 
              angle: -45,         // Rota 45 grados hacia arriba
              textAnchor: 'end',  // Alinea el texto al final para que coincida con la marca
              verticalAnchor: 'middle' // Centra verticalmente respecto a la línea
            }
          }}
        />

        <VictoryAxis dependentAxis />

        <VictoryBar
          data={dataNormalizada}
          cornerRadius={{ top: 4 }}
          labels={({ datum }) => datum.y}
        />
      </VictoryChart>
    </div>
  );
};

export default EstadisticaBarra;
