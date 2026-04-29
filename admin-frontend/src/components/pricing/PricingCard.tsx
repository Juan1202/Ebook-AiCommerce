import { useState, useEffect } from "react";
import PricingChart from "./PricingChart";
import { recalculatePrice } from "../../services/pricingService";
import styles from "./PricingCard.module.css";

interface Props {
  data: any;
}

const PricingCard = ({ data }: Props) => {
  const [price, setPrice] = useState(data.price);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const getDate = () =>
    new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  useEffect(() => {
    const saved = localStorage.getItem(`history-${data.book_id}`);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleRecalculate = async () => {
    setLoading(true);

    let newPrice;

    try {
      const res = await recalculatePrice(data.book_id, data.title, data.condition ?? "BUENO");
      newPrice = res.suggested_price ?? res.price;
    } catch {
      const min = Number(localStorage.getItem("minPrice") || 40000);
      const max = Number(localStorage.getItem("maxPrice") || 80000);
      newPrice = Math.floor(Math.random() * (max - min) + min);
    }

    setPrice(newPrice);

    const updated = [{ price: newPrice, date: getDate() }, ...history];
    setHistory(updated);

    localStorage.setItem(`history-${data.book_id}`, JSON.stringify(updated));

    window.dispatchEvent(new Event("storage"));

    setLoading(false);
  };

  return (
    <div className={styles.card}>
      <h3>{data.title}</h3>
      <p className={styles.price}>${price}</p>

      <span className={data.isFallback ? styles.estimated : styles.verified}>
        {data.isFallback ? "Estimado" : "Verificado"}
      </span>

      <div className={styles.buttons}>
        <button onClick={() => setShow(!show)}>Detalle</button>
        <button onClick={handleRecalculate} disabled={loading}>
          {loading ? "..." : "Recalcular"}
        </button>
      </div>

      {show && (
        <div>
          <p><strong>Historial</strong></p>
          <ul>
            {history.map((h, i) => (
              <li key={i}>${h.price} - {h.date}</li>
            ))}
          </ul>

          <PricingChart history={history} />
        </div>
      )}
    </div>
  );
};

export default PricingCard;