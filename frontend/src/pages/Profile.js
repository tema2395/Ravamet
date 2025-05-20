import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        name: '',
        surname: '',
        patronymic: '',
        cv_text: '',
        password: '', // Optional: for changing password
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Simplified styles, relying on global styles from index.css
    const pageStyles = {
        container: { // This is the overall page container, managed by .page-container in index.css
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center the content sections
        },
        profileSection: { // For the display and form sections
            backgroundColor: 'var(--background-card)',
            padding: '25px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            width: '100%',
            maxWidth: '700px', // Max width for content
            marginBottom: '30px',
        },
        heading: {
             textAlign: 'center',
             color: 'var(--corporate-red)',
             marginBottom: '20px',
        },
        infoItem: {
            marginBottom: '12px',
            fontSize: '1rem',
            color: 'var(--text-dark)',
        },
        infoLabel: { // For "ID:", "Email:", etc.
            fontWeight: 'bold',
            color: 'var(--text-dark)', // Ensuring it's not too light
        },
        loading: {
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--text-dark)',
            padding: '30px',
        },
        buttonGroup: { // For multiple buttons in a row
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
        }
    };
    
    const fetchUserProfile = useCallback(async () => { // Added useCallback
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('No access token found. Please login.'); // This error won't be seen as navigate happens
            navigate('/login', { state: { message: 'Please login to view your profile.' }});
            return; // Important to stop execution
        }
        setError(''); // Clear previous errors before fetching
        setMessage('');

        try {
            const response = await axios.get('/api/users/me', { // Ensure this is the correct endpoint
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(response.data);
            setFormData({
                email: response.data.email || '',
                phone: response.data.phone || '',
                name: response.data.name || '',
                surname: response.data.surname || '',
                patronymic: response.data.patronymic || '',
                cv_text: response.data.cv_text || '',
                password: '', 
            });
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to fetch user profile.';
            setError(errorMsg);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('accessToken'); // Clear token
                navigate('/login', { state: { message: 'Session expired. Please login again.' } });
            }
        }
    }, [navigate]); // Added navigate to dependency array

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]); // Changed dependency to fetchUserProfile

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication token not found. Please login again.');
            navigate('/login');
            return;
        }

        // Prepare data for update, excluding empty password if not being changed
        const updateData = { ...formData };
        if (!updateData.password) {
            delete updateData.password;
        }
        
        // Ensure no null values are sent for optional fields if they are empty strings
        for (const key in updateData) {
            if (updateData[key] === '') {
                // Backend expects null for optional fields if not provided, or actual value
            // Backend Pydantic models usually handle Optional fields correctly with empty strings
            // becoming None if the field is truly optional, or an error if not.
            // For `Optional[str] = None`, FastAPI/Pydantic typically converts empty string to None.
            // For `Optional[str] = ""`, an empty string is valid.
            // Let's assume backend handles empty strings appropriately for optional text fields.
        }

        try {
            await axios.put('/api/users/me', updateData, { // Ensure this is the correct endpoint
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Profile updated successfully!');
            fetchUserProfile(); 
        } catch (err) {
            const errorDetail = err.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                const formattedError = errorDetail.map(el => `${el.loc.join('.')} - ${el.msg}`).join('; ');
                setError(formattedError);
            } else {
                setError(errorDetail || 'Failed to update profile. Please try again.');
            }
        }
    };

    if (!userData && !error) { // Still fetching initial data
        return <div style={pageStyles.loading}>Loading profile...</div>;
    }
    
    // If there was an error fetching initial data and no user data is available
    if (error && !userData) { 
        return (
            <div style={pageStyles.container}>
                 <p className="message-error" style={{width: '100%', maxWidth: '600px'}}>{error}</p>
                 <button onClick={() => navigate('/login')} className="button-style">Go to Login</button>
            </div>
        );
    }

    return (
        <div style={pageStyles.container}>
            {/* Global messages for the page */}
            {error && !message && <p className="message-error" style={{width: '100%', maxWidth: '700px'}}>{error}</p>}
            {message && <p className="message-success" style={{width: '100%', maxWidth: '700px'}}>{message}</p>}

            {userData && (
                <div style={pageStyles.profileSection}>
                    <h2 style={pageStyles.heading}>Your Profile</h2>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>ID:</span> {userData.id}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Email:</span> {userData.email}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Name:</span> {userData.name}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Surname:</span> {userData.surname || 'N/A'}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Patronymic:</span> {userData.patronymic || 'N/A'}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Phone:</span> {userData.phone || 'N/A'}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Status:</span> {userData.status}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>CV:</span> {userData.cv_text || 'N/A'}</p>
                    <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Joined:</span> {new Date(userData.created).toLocaleDateString()}</p>
                </div>
            )}

            <div style={pageStyles.profileSection}>
                <h2 style={pageStyles.heading}>Update Profile</h2>
                <form onSubmit={handleSubmit}>
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
                    
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="e.g., +1234567890"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    
                    <label htmlFor="surname">Surname</label>
                    <input
                        type="text"
                        name="surname"
                        id="surname"
                        placeholder="Your Surname"
                        value={formData.surname}
                        onChange={handleChange}
                    />
                    
                    <label htmlFor="patronymic">Patronymic</label>
                    <input
                        type="text"
                        name="patronymic"
                        id="patronymic"
                        placeholder="Your Patronymic"
                        value={formData.patronymic}
                        onChange={handleChange}
                    />
                    
                    <label htmlFor="cv_text">CV / Resume Summary</label>
                    <textarea
                        name="cv_text"
                        id="cv_text"
                        placeholder="Briefly describe your experience"
                        value={formData.cv_text}
                        onChange={handleChange}
                        rows="4"
                    />
                    
                    <label htmlFor="password">New Password (Optional)</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Leave blank to keep current password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    
                    <button type="submit">Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
