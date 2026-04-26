interface Props {
  filter: string;
  setFilter: (value: string) => void;
}

const PricingFilters = ({ setFilter }: Props) => {
  return (
    <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
      <button onClick={() => setFilter("all")}>Todos</button>
      <button onClick={() => setFilter("verified")}>Verificados</button>
      <button onClick={() => setFilter("estimated")}>Estimados</button>
    </div>
  );
};

export default PricingFilters;