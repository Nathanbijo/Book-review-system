// src/pages/Reviewdetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchExternalBookDetails, fetchBookReviews, submitBookReview } from '../api';
import CoverImage from '../components/CoverImage';

export default function Reviewdetails() {
  const { id } = useParams(); // OLID
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [newStars, setNewStars] = useState(0);
  const [newText, setNewText] = useState('');

  // Load book details and reviews on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [bookData, reviewData] = await Promise.all([
          fetchExternalBookDetails(id),
          fetchBookReviews(id),
        ]);
        if (!cancelled) {
          setBook(bookData);
          setReviews(reviewData || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Failed to load book information');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Review submission handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newStars) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitBookReview(id, { stars: newStars, text: newText });
      const updated = await fetchBookReviews(id);
      setReviews(updated || []);
      setNewStars(0);
      setNewText('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading and error states
  if (loading) {
    return <div className="book-page loading">Loading book information…</div>;
  }

  if (error) {
    return <div className="book-page error">{error}</div>;
  }

  if (!book) {
    return <div className="book-page error">Book not found.</div>;
  }

  // Render book info page
  return (
    <div className="book-page">
      {/* Book header section */}
      <div className="book-page-header">
        <div className="book-page-cover">
          <CoverImage coverUrl={book.coverUrl} title={book.title} />
        </div>
        <div className="book-page-main">
          <h1 className="book-page-title">{book.title}</h1>
          {book.authors && book.authors.length > 0 && (
            <p className="book-page-authors">
              {book.authors.join(', ')}
            </p>
          )}
          {book.publishDate && (
            <p className="book-page-meta">
              First published {book.publishDate}
            </p>
          )}
          <p className="book-page-rating-summary">
            {book.avgStars != null ? `${book.avgStars.toFixed(1)}★` : 'No ratings yet'} ·{' '}
            {book.reviewCount || 0} review{(book.reviewCount || 0) === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="book-page-body">
        {/* Description section */}
        {book.description && (
          <section className="book-page-section">
            <h2>About this book</h2>
            <p className="book-page-description">{book.description}</p>
          </section>
        )}

        {/* Metadata section */}
        <section className="book-page-section">
          <h2>Details</h2>
          <div className="book-page-details-grid">
            {book.publishDate && (
              <div>
                <h3>Published</h3>
                <p>{book.publishDate}</p>
              </div>
            )}
            {book.languages && book.languages.length > 0 && (
              <div>
                <h3>Languages</h3>
                <p>{book.languages.join(', ')}</p>
              </div>
            )}
            {book.subjects && book.subjects.length > 0 && (
              <div>
                <h3>Subjects</h3>
                <p>{book.subjects.slice(0, 8).join(', ')}</p>
              </div>
            )}
            {book.places && book.places.length > 0 && (
              <div>
                <h3>Places</h3>
                <p>{book.places.join(', ')}</p>
              </div>
            )}
            {book.times && book.times.length > 0 && (
              <div>
                <h3>Times</h3>
                <p>{book.times.join(', ')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Reviews list section */}
        <section className="book-page-section">
          <h2>Reader reviews</h2>
          {reviews.length === 0 && <p>No reviews yet. Be the first to review this book.</p>}
          {reviews.map((rev) => (
            <div key={rev.id} className="book-review-card">
              <div className="book-review-header">
                <span className="book-review-user">{rev.username}</span>
                <span className="book-review-stars">{'★'.repeat(rev.stars)}{'☆'.repeat(5 - rev.stars)}</span>
              </div>
              {rev.text && <p className="book-review-text">{rev.text}</p>}
              {rev.created_at && (
                <p className="book-review-date">
                  {new Date(rev.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Review submission form */}
        <section className="book-page-section">
          <h2>Write a review</h2>
          <form className="book-review-form" onSubmit={handleSubmitReview}>
            <label className="book-review-form-row">
              <span>Rating</span>
              <select
                value={newStars}
                onChange={(e) => setNewStars(Number(e.target.value))}
              >
                <option value={0}>Select...</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
                ))}
              </select>
            </label>
            <label className="book-review-form-row">
              <span>Your thoughts (optional)</span>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={4}
                placeholder="What did you think about this book?"
              />
            </label>
            <button type="submit" disabled={submitting || !newStars}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </section>

        {/* Open Library attribution */}
        <section className="book-page-section book-page-attribution">
          <p>
            Book data from{' '}
            <a href={`https://openlibrary.org/works/${book.id}`} target="_blank" rel="noreferrer">
              Open Library
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
