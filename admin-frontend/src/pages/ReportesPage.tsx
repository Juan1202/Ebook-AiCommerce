import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ReportesPage = () => {
  const [data, setData] = useState<any[]>([]);

  const loadData = () => {
    const all: any[] = [];

    for (let key in localStorage) {
      if (key.startsWith("history-")) {
        const history = JSON.parse(localStorage.getItem(key) || "[]");

        history.forEach((h: any) => {
          all.push({ fecha: h.date, precio: h.price });
        });
      }
    }

    setData(all.reverse());
  };

  useEffect(() => {
    loadData();

    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  return (
    <div>
      <h1>Reportes</h1>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Line dataKey="precio" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportesPage;