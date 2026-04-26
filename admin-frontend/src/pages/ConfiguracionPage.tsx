import { useState, useEffect } from "react";

const ConfiguracionPage = () => {
  const [min, setMin] = useState(40000);
  const [max, setMax] = useState(80000);

  useEffect(() => {
    const savedMin = localStorage.getItem("minPrice");
    const savedMax = localStorage.getItem("maxPrice");

    if (savedMin) setMin(Number(savedMin));
    if (savedMax) setMax(Number(savedMax));
  }, []);

  const save = () => {
    localStorage.setItem("minPrice", String(min));
    localStorage.setItem("maxPrice", String(max));
    alert("Guardado");
  };

  return (
    <div>
      <h1>Configuración</h1>

      <div>
        <label>Precio mínimo</label>
        <input value={min} onChange={(e) => setMin(Number(e.target.value))} />

        <label>Precio máximo</label>
        <input value={max} onChange={(e) => setMax(Number(e.target.value))} />

        <button onClick={save}>Guardar</button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;