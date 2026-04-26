export default function CatalogFilters({ categories = [], filters = {}, setFilters }) {
  const update = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      category_id: '',
      condition: '',
      publisher: '',
      publication_year: '',
      min_price: '',
      max_price: ''
    })
  }

  return (
    <section className="filters-section">
      <div className="category-tabs">
        <button
          className={!filters.category_id ? 'active' : ''}
          onClick={() => update('category_id', '')}
        >
          Todos
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            className={String(filters.category_id) === String(category.id) ? 'active' : ''}
            onClick={() => update('category_id', category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="advanced-filters">
        <label>
          Condición
          <select
            value={filters.condition || ''}
            onChange={e => update('condition', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="regular">Regular</option>
          </select>
        </label>

        <label>
          Editorial
          <input
            value={filters.publisher || ''}
            onChange={e => update('publisher', e.target.value)}
            placeholder="Editorial"
          />
        </label>

        <label>
          Año
          <input
            type="number"
            value={filters.publication_year || ''}
            onChange={e => update('publication_year', e.target.value)}
            placeholder="Año"
          />
        </label>

        <label>
          Precio mínimo
          <input
            type="number"
            value={filters.min_price || ''}
            onChange={e => update('min_price', e.target.value)}
            placeholder="$ Min"
          />
        </label>

        <label>
          Precio máximo
          <input
            type="number"
            value={filters.max_price || ''}
            onChange={e => update('max_price', e.target.value)}
            placeholder="$ Max"
          />
        </label>

        <button className="clear-filters" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}