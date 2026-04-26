import { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import PricingFilters from "./PricingFilters";

interface PricingItem {
  book_id: string;
  title: string;
  price: number;
  isFallback: boolean;
}

const PricingDashboard = () => {
  const [data, setData] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      setData([
        { book_id: "1", title: "El Hobbit", price: 50000, isFallback: false },
        { book_id: "2", title: "Clean Code", price: 70000, isFallback: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <p>Cargando...</p>;

  const filtered = data.filter((item) => {
    if (filter === "verified") return !item.isFallback;
    if (filter === "estimated") return item.isFallback;
    return true;
  });

  return (
    <>
      <PricingFilters filter={filter} setFilter={setFilter} />

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {filtered.map((item) => (
          <PricingCard key={item.book_id} data={item} />
        ))}
      </div>
    </>
  );
};

export default PricingDashboard;