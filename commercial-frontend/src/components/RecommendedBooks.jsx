import { useState, useEffect } from "react";
import { getRecommendations } from "../services/recommendationService";

export default function RecommendedBooks({ bookId, onBookClick }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    getRecommendations(bookId)
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return <div className="recommended-loading">Cargando recomendaciones...</div>;
  if (!books.length) return null;

  return (
    <section className="recommended-section">
      <h3 className="recommended-title">También te puede interesar</h3>
      <div className="recommended-scroll">
        {books.map((book) => (
          <button
            key={book.book_id}
            className="recommended-card"
            onClick={() => onBookClick?.(book.book_id)}
          >
            <div className="recommended-card__placeholder">
              {(book.title || "?")[0].toUpperCase()}
            </div>
            <p className="recommended-card__title">{book.title}</p>
            <p className="recommended-card__author">{book.author}</p>
            <span className="recommended-card__reason">{book.reason}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
