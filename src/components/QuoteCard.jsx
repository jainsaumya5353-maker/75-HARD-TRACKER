import React from 'react';
import { MOTIVATIONAL_QUOTES } from '../utils/constants';

const QuoteCard = ({ dayNumber }) => {
    const quoteIndex = (dayNumber - 1) % MOTIVATIONAL_QUOTES.length;
    const quote = MOTIVATIONAL_QUOTES[quoteIndex];

    return (
        <div className="quote-card animate-in">
            <p className="quote-text">{quote.quote}</p>
            <p className="quote-author">— {quote.author}</p>
        </div>
    );
};

export default QuoteCard;
