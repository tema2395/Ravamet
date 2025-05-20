import React, { useState }
from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '', // FastAPI's OAuth2PasswordRequestForm expects 'username'
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); // To get state passed from other components

    useEffect(() => {
        // Display message from redirection if any (e.g., from CreateVacancy if not logged in)
        if (location.state?.message) {
            setMessage(location.state.message);
            // Clear the message from location state so it doesn't reappear on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const formPayload = new FormData();
            formPayload.append('username', formData.username);
            formPayload.append('password', formData.password);

            const response = await axios.post('/api/auth/login', formPayload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            localStorage.setItem('accessToken', response.data.access_token);
            setMessage('Login successful! Redirecting...');
            // Redirect to profile or previous page if stored
            const from = location.state?.from || '/profile';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    };

    // Minimal inline styles, relying on global styles from index.css
    const pageStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)', // Adjust for nav
        },
        form: {
            backgroundColor: 'var(--background-card)',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            width: '100%',
            maxWidth: '400px',
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
                <h2 style={pageStyles.heading}>Welcome Back!</h2>
                {message && <p className="message-success">{message}</p>}
                {error && <p className="message-error">{error}</p>}
                
                <label htmlFor="username">Email (Username)*</label>
                <input
                    type="email"
                    name="username"
                    id="username"
                    placeholder="you@example.com"
                    value={formData.username}
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
