import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)', // Adjust for nav and potential footer
            textAlign: 'center',
            padding: '20px',
        },
        heading: {
            fontSize: '3em',
            color: 'var(--corporate-red)',
            marginBottom: '20px',
        },
        message: {
            fontSize: '1.2em',
            color: 'var(--text-dark)',
            marginBottom: '30px',
        },
        // Link will use .button-style from index.css
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>404 - Page Not Found</h1>
            <p style={styles.message}>
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="button-style">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
