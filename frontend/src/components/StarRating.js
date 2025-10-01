import React from "react";

export default function StarRating({ value = 0, onRate }) {
  const rounded = Math.round(value || 0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`star ${n <= rounded ? "active" : ""}`}
          onClick={() => onRate?.(n)}
          title={`${n} star${n>1 ? "s":""}`}
        >
          ★
        </button>
      ))}
      <span className="stars-label">
        {value ? `${value}/5` : "No rating"}
      </span>
    </div>
  );
}
