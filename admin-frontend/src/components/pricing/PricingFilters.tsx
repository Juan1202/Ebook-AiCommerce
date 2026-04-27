import styles from "./PricingFilters.module.css";

interface Props {
  filter: string;
  setFilter: (value: string) => void;
}

const FILTERS = [
  { value: "all",       label: "Todos",       icon: "📋" },
  { value: "verified",  label: "Verificados",  icon: "✅" },
  { value: "estimated", label: "Estimados",    icon: "⚠️" },
];

const PricingFilters = ({ filter, setFilter }: Props) => (
  <div className={styles.bar}>
    {FILTERS.map((f) => (
      <button
        key={f.value}
        className={`${styles.chip} ${filter === f.value ? styles.active : ""}`}
        onClick={() => setFilter(f.value)}
      >
        <span>{f.icon}</span> {f.label}
      </button>
    ))}
  </div>
);

export default PricingFilters;
