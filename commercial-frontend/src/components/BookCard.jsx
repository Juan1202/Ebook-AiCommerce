const CATEGORY_NAMES = {
  1: 'Ficción', 2: 'No Ficción', 3: 'Ciencia', 4: 'Historia',
  5: 'Filosofía', 6: 'Tecnología', 7: 'Arte', 8: 'Economía',
}

export default function BookCard({ book, onClick }) {
  const category = CATEGORY_NAMES[book.category_id] || null

  return (
    <article className="book-card" onClick={() => onClick(book)}>
      <div className="book-cover-wrap">
        <img
          className="book-cover"
          src={book.cover_url || `https://via.placeholder.com/400x600/1B4332/FFFFFF?text=${encodeURIComponent(book.title.slice(0, 12))}`}
          alt={book.title}
          onError={e => {
            e.target.src = `https://via.placeholder.com/400x600/2D6A4F/FFFFFF?text=${encodeURIComponent(book.title.slice(0, 10))}`
          }}
          loading="lazy"
        />
        {category && <span className="book-category-badge">{category}</span>}
      </div>

      <div className="book-body">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {book.publisher && <p className="book-publisher">{book.publisher}</p>}
      </div>

      <button className="book-cta">Ver detalle →</button>
    </article>
  )
}
