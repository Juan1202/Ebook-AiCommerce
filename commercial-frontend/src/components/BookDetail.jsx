const CATEGORY_NAMES = {
  1: 'Ficción', 2: 'No Ficción', 3: 'Ciencia', 4: 'Historia',
  5: 'Filosofía', 6: 'Tecnología', 7: 'Arte', 8: 'Economía',
}

export default function BookDetail({ book, onBack }) {
  if (!book) return null

  const category = CATEGORY_NAMES[book.category_id]
  const hasCover = Boolean(book.cover_url)

  return (
    <div className="detail-page">
      <header className="store-header">
        <div className="header-inner">
          <a className="header-logo" href="#" onClick={e => { e.preventDefault(); onBack() }}>
            <div className="logo-icon">📚</div>
            <div>
              <div className="logo-text">BookFlow</div>
              <div className="logo-tagline">Tu librería</div>
            </div>
          </a>
        </div>
      </header>

      <div className="detail-breadcrumb">
        <button className="back-btn" onClick={onBack}>
          ← Volver al catálogo
        </button>
      </div>

      <div className="detail-body">
        <aside className="detail-cover-wrap">
          {hasCover ? (
            <img
              className="detail-cover"
              src={book.cover_url}
              alt={book.title}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="detail-cover-placeholder">📖</div>
          )}
        </aside>

        <main className="detail-info">
          {category && <span className="detail-category">{category}</span>}

          <h1 className="detail-title">{book.title}</h1>

          {book.subtitle && (
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
              {book.subtitle}
            </p>
          )}

          <p className="detail-author">por <strong>{book.author}</strong></p>

          <div className="detail-divider" />

          <div className="detail-meta-grid">
            {book.publisher && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Editorial</span>
                <span className="detail-meta-value">{book.publisher}</span>
              </div>
            )}
            {book.publication_year && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Año</span>
                <span className="detail-meta-value">{book.publication_year}</span>
              </div>
            )}
            {book.isbn && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">ISBN</span>
                <span className="detail-meta-value" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{book.isbn}</span>
              </div>
            )}
            {book.issn && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">ISSN</span>
                <span className="detail-meta-value" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{book.issn}</span>
              </div>
            )}
          </div>

          {book.description && (
            <>
              <div className="detail-divider" />
              <p className="detail-description">{book.description}</p>
            </>
          )}

          <div className="detail-available-badge">
            <span>✓</span>
            Disponible en tienda
          </div>
        </main>
      </div>
    </div>
  )
}
