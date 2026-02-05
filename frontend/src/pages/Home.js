import CoverImage from "../components/CoverImage";

// ... inside Home component
// ...
return (
  <Link to={`/review/${b.id}`} key={b.id} className="book-card">
    <figure className="book-cover">
      <CoverImage coverUrl={b.coverUrl} title={b.title} />
    </figure>
    <div className="book-meta">
      <h3 className="book-title">{b.title}</h3>
      <p className="book-author">{b.authors?.join(", ") || "Unknown Author"}</p>
      <div className="book-row">
        <Stars value={rating} />
        <span className="book-rating">
          No ratings
        </span>
      </div>
      <div className="book-tags">
        <span className="tag">{selectedGenre}</span>
        <span className="dot">•</span>
        <span className="muted">{b.first_publish_year || "—"}</span>
      </div>
    </div>
  </Link>
);
        })}

{
  !loading && !error && books.length === 0 && (
    <div className="empty">No books found.</div>
  )
}
      </section >
    </div >
  );
}
