import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        name: '',
        surname: '',
        patronymic: '',
        cv_text: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            // Assuming API endpoint is /api/auth/register as per previous setup
            await axios.post('/api/auth/register', formData);
            setMessage('Registration successful! You can now log in.');
            // Optionally redirect to login page or display a success message for longer
            // setTimeout(() => navigate('/login'), 2000); 
        } catch (err) {
            const errorDetail = err.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                const formattedError = errorDetail.map(el => `${el.loc.join('.')} - ${el.msg}`).join('; ');
                setError(formattedError);
            } else {
                setError(errorDetail || 'Registration failed. Please try again.');
            }
        }
    };

    // Minimal inline styles, relying on global styles from index.css
    const pageStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)', // Adjust considering nav and potential footer
        },
        form: {
            backgroundColor: 'var(--background-card)',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            width: '100%',
            maxWidth: '450px', // Slightly wider for better spacing
        },
        heading: {
             textAlign: 'center',
             color: 'var(--corporate-red)',
             marginBottom: '25px',
        }
    };

    return (
        <div style={pageStyles.container}>
            <form onSubmit={handleSubmit} style={pageStyles.form}>
                <h2 style={pageStyles.heading}>Create Your Account</h2>
                {message && <p className="message-success">{message}</p>}
                {error && <p className="message-error">{error}</p>}
                
                <label htmlFor="email">Email*</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                
                <label htmlFor="password">Password*</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="name">Name*</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="phone">Phone (Optional)</label>
                <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="e.g., +1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <label htmlFor="surname">Surname (Optional)</label>
                <input
                    type="text"
                    name="surname"
                    id="surname"
                    placeholder="Your Surname"
                    value={formData.surname}
                    onChange={handleChange}
                />

                <label htmlFor="patronymic">Patronymic (Optional)</label>
                <input
                    type="text"
                    name="patronymic"
                    id="patronymic"
                    placeholder="Your Patronymic"
                    value={formData.patronymic}
                    onChange={handleChange}
                />

                <label htmlFor="cv_text">CV / Resume Summary (Optional)</label>
                <textarea
                    name="cv_text"
                    id="cv_text"
                    placeholder="Briefly describe your experience or attach CV later"
                    value={formData.cv_text}
                    onChange={handleChange}
                    rows="4" // Adjusted rows
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
