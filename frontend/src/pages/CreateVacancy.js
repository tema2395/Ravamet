import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateVacancy = () => {
    const [formData, setFormData] = useState({
        name: '',
        salary: '', // Will be converted to float or null
        short_description: '',
        full_description: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Redirect to login, passing the current path to redirect back after login
            navigate('/login', { 
                state: { 
                    message: 'You must be logged in to create a vacancy.',
                    from: '/create-vacancy' // Store the intended destination
                } 
            });
        }
    }, [navigate]);

    // Refined styles, leveraging global styles
    const pageStyles = {
        container: { // This is the page container, centered by .page-container in App.js
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center the form card
        },
        form: { // The form card itself
            backgroundColor: 'var(--background-card)',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            width: '100%',
            maxWidth: '700px', // Consistent max-width for forms
        },
        heading: {
             textAlign: 'center',
             color: 'var(--corporate-red)',
             marginBottom: '25px',
             borderBottom: `2px solid var(--corporate-red)`,
             paddingBottom: '10px',
        },
        // Inputs, Textareas, Buttons, Labels, Messages will use global styles from index.css
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setLoading(false);
            navigate('/login');
            return;
        }

        const dataToSubmit = {
            ...formData,
            salary: formData.salary ? parseFloat(formData.salary) : null,
        };

        if (formData.salary && isNaN(dataToSubmit.salary)) {
            setError('Salary must be a valid number.');
            setLoading(false);
            return;
        }
        
        // Ensure optional fields are null if empty, rather than empty strings, if backend requires it.
        // Pydantic usually handles empty strings for Optional[str] by converting them to None if `None` is the default.
        // Or, they remain empty strings if the type is just `str`.
        // For `Optional[float]`, an empty string would cause a validation error.
        if (dataToSubmit.full_description === '') {
            dataToSubmit.full_description = null;
        }


        try {
            const response = await axios.post('/api/vacancies/', dataToSubmit, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('Vacancy created successfully! Redirecting...');
            // Assuming the response.data contains the created vacancy and its id
            const newVacancyId = response.data.id; 
            setTimeout(() => {
                if (newVacancyId) {
                    navigate(`/vacancies/${newVacancyId}`);
                } else {
                    navigate('/vacancies'); // Fallback if ID is not in response
                }
            }, 2000);
        } catch (err) {
            const errorDetail = err.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                // Handle Pydantic validation errors
                const formattedError = errorDetail.map(el => `${el.loc.join('.')} - ${el.msg}`).join('; ');
                setError(formattedError);
            } else {
                setError(errorDetail || 'Failed to create vacancy. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyles.container}>
            <form onSubmit={handleSubmit} style={pageStyles.form}>
                <h2 style={pageStyles.heading}>Create New Vacancy</h2>
                {message && <p className="message-success">{message}</p>}
                {error && <p className="message-error">{error}</p>}

                <label htmlFor="name">Vacancy Name*</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="salary">Salary (Optional, e.g., 60000)</label>
                <input
                    type="number"
                    name="salary"
                    id="salary"
                    placeholder="Annual salary in USD"
                    value={formData.salary}
                    onChange={handleChange}
                    step="0.01" 
                />

                <label htmlFor="short_description">Short Description*</label>
                <textarea
                    name="short_description"
                    id="short_description"
                    placeholder="A brief summary of the vacancy (max 250 characters)"
                    value={formData.short_description}
                    onChange={handleChange}
                    rows="3" // Adjusted rows
                    maxLength="250" 
                    required
                />

                <label htmlFor="full_description">Full Description (Optional)</label>
                <textarea
                    name="full_description"
                    id="full_description"
                    placeholder="Provide a detailed job description, responsibilities, qualifications, etc."
                    value={formData.full_description}
                    onChange={handleChange}
                    rows="6" // Adjusted rows
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Create Vacancy'}
                </button>
            </form>
        </div>
    );
};

export default CreateVacancy;
