export default function CatalogFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val })
  const hasActive = filters.minPrice || filters.maxPrice || filters.condition

  return (
    <div className="catalog-filters">
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Condición</label>
          <select
            className="filter-select"
            value={filters.condition || ''}
            onChange={e => set('condition', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="NUEVO">Nuevo</option>
            <option value="BUENO">Bueno</option>
            <option value="ACEPTABLE">Aceptable</option>
            <option value="DETERIORADO">Deteriorado</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Precio mínimo</label>
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="$ Min"
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Precio máximo</label>
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="$ Max"
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
          />
        </div>

        {hasActive && (
          <button
            className="filter-clear-btn"
            onClick={() => onChange({ condition: '', minPrice: '', maxPrice: '' })}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
