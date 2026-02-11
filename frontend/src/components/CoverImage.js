import React, { useState } from 'react';

function getInitials(title) {
    if (!title) return '?';
    const words = title.trim().split(/\s+/);
    const first = words[0]?.[0] || '';
    const second = words[1]?.[0] || '';
    return (first + second).toUpperCase();
}

function pastelColor(title) {
    let h = 0;
    for (let i = 0; i < title.length; i++) {
        h = (h * 31 + title.charCodeAt(i)) % 360;
    }
    return `hsl(${h}, 70%, 90%)`;
}

export default function CoverImage({ coverUrl, title, className, alt }) {
    const [error, setError] = useState(false);

    if (coverUrl && !error) {
        return (
            <img
                src={coverUrl}
                alt={alt || title}
                className={className}
                onError={() => setError(true)}
                loading="lazy"
            />
        );
    }

    const initials = getInitials(title);
    const bg = pastelColor(title || '?');

    return (
        <div
            className="book-cover-fallback"
            style={{ backgroundColor: bg }}
            role="img"
            aria-label={alt || title}
        >
            <span className="book-cover-fallback__initials">{initials}</span>
        </div>
    );
}
