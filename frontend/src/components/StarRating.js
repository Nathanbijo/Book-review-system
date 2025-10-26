import React, { useState, useEffect } from "react";

/**
 * StarRating
 * - value: number (0..5) to display
 * - editable: boolean (show hover + selection)
 * - onChange: (n) => void when editable
 * - showLabel: boolean (default true) — show "x/5" label
 */
export default function StarRating({ value = 0, editable = false, onChange, showLabel = true }) {
  const [hover, setHover] = useState(0);
  useEffect(() => { if (!editable) setHover(0); }, [editable]);

  const shown = hover || Math.round(value || 0);

  return (
    <div className="stars" role="img" aria-label={`${value || 0} of 5`}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`star ${n <= shown ? "active" : ""}`}
          aria-pressed={n <= shown}
          aria-label={`${n} star${n>1?"s":""}`}
          onMouseEnter={() => editable && setHover(n)}
          onMouseLeave={() => editable && setHover(0)}
          onClick={() => editable && onChange && onChange(n)}
          title={`${n} star${n>1?"s":""}`}
        >★</button>
      ))}
      {showLabel && <span className="stars-label">{value ? `${value}/5` : "No rating"}</span>}
    </div>
  );
}
