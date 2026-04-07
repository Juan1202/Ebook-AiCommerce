import React from "react";

const Filtros = ({ setFiltroEstado }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={() => setFiltroEstado("")}>Todos</button>
      <button onClick={() => setFiltroEstado("COMPLETADO")}>Completado</button>
      <button onClick={() => setFiltroEstado("ERROR")}>Error</button>
      <button onClick={() => setFiltroEstado("PROCESADO")}>Procesado</button>
    </div>
  );
};

export default Filtros;