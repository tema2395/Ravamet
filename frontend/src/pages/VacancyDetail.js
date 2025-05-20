import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const VacancyDetail = () => {
    const { id: vacancyId } = useParams();
    const navigate = useNavigate();

    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // For editing
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        salary: '',
        short_description: '',
        full_description: '',
    });

    // For status change
    const [newStatus, setNewStatus] = useState('');
    
    // Check if user is logged in (basic check)
    const isLoggedIn = !!localStorage.getItem('accessToken');

    // Refined styles, leveraging global styles
    const pageStyles = {
        // container is now .page-container from App.js, centering done by its auto margins
        detailCard: { // This is the main card holding all content
            backgroundColor: 'var(--background-card)',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            width: '100%',
            maxWidth: '850px', // Max width for the detail card
            marginBottom: '30px',
        },
        heading: { // For the vacancy name
            color: 'var(--corporate-red)',
            fontSize: '2em', // Larger heading
            borderBottom: `3px solid var(--corporate-red)`,
            paddingBottom: '15px',
            marginBottom: '20px',
        },
        subHeading: { // For "Short Description", "Full Description", "Manage Vacancy"
            color: 'var(--text-dark)',
            fontSize: '1.4em',
            marginTop: '25px',
            marginBottom: '15px',
            borderBottom: `1px solid #eee`,
            paddingBottom: '8px',
        },
        infoItem: {
            fontSize: '1rem',
            marginBottom: '12px',
            color: 'var(--text-dark)',
        },
        infoLabel: { // For "Status:", "Salary:", etc.
            fontWeight: 'bold',
        },
        description: {
            fontSize: '1rem',
            lineHeight: '1.7', // More line spacing for readability
            color: 'var(--text-dark)',
            whiteSpace: 'pre-wrap', 
            marginBottom: '15px',
        },
        actionsContainer: {
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '1px solid #ddd', // Slightly darker border
        },
        // Buttons will use global .button-style or button tag styling
        // Inputs/Textarea/Select will use global styles
        editForm: { // Container for the edit form
            display: 'flex',
            flexDirection: 'column',
            gap: '15px', // Space between form elements
        },
        statusChangeContainer: {
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px', // Space between label and select
        },
        loading: { 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            color: 'var(--text-dark)', 
            padding: '40px',
        },
        // Success/Error messages use global .message-success and .message-error
        // Back to Vacancies button can use .button-style with a different color
        buttonGroup: {
            display: 'flex',
            gap: '10px',
            marginTop: '10px', // For buttons like Save/Cancel in edit form
        }
    };

    const fetchVacancyDetail = useCallback(async () => {
        setLoading(true);
        // Ensure messages are cleared on new fetch attempt
        setError(''); // Clear previous page-level errors
        setMessage(''); // Clear previous success messages
        try {
            const response = await axios.get(`/api/vacancies/${vacancyId}`);
            setVacancy(response.data);
            setEditFormData({
                name: response.data.name || '',
                // Ensure salary is empty string if null/undefined, or its value for the input
                salary: response.data.salary ? response.data.salary.toString() : '', 
                short_description: response.data.short_description || '',
                full_description: response.data.full_description || '',
            });
            setNewStatus(response.data.status); 
        } catch (err) {
            setError(err.response?.data?.detail || `Failed to fetch vacancy (ID: ${vacancyId}). Please try again.`);
            setVacancy(null);
        } finally {
            setLoading(false);
        }
    }, [vacancyId]);

    useEffect(() => {
        fetchVacancyDetail();
    }, [fetchVacancyDetail]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setMessage('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('You must be logged in to update vacancies.');
            navigate('/login', { state: { message: 'Please login to continue.' }});
            return;
        }
        try {
            const dataToUpdate = { ...editFormData };
            dataToUpdate.salary = dataToUpdate.salary ? parseFloat(dataToUpdate.salary) : null;
            if (editFormData.salary && isNaN(dataToUpdate.salary)) { // Check if salary was provided but is not a number
                setError('Salary must be a valid number or empty.');
                return;
            }
            // Optional fields: if empty, send null or omit based on API design
            if (dataToUpdate.full_description === '') dataToUpdate.full_description = null;


            await axios.put(`/api/vacancies/${vacancyId}`, dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Vacancy updated successfully!');
            setIsEditing(false);
            fetchVacancyDetail(); 
        } catch (err) {
            const errorDetail = err.response?.data?.detail;
            if (Array.isArray(errorDetail)) {
                setError(errorDetail.map(el => `${el.loc.join('.')} - ${el.msg}`).join('; '));
            } else {
                setError(errorDetail || 'Failed to update vacancy.');
            }
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this vacancy? This action cannot be undone.')) return;
        setError('');
        setMessage('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('You must be logged in to delete vacancies.');
            navigate('/login', { state: { message: 'Please login to continue.' }});
            return;
        }
        try {
            await axios.delete(`/api/vacancies/${vacancyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Vacancy deleted successfully. Redirecting...');
            setTimeout(() => navigate('/vacancies'), 2000);
        } catch (err) {
             setError(err.response?.data?.detail || 'Failed to delete vacancy.');
        }
    };

    const handleStatusChange = async (selectedStatus) => {
        setError('');
        setMessage('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('You must be logged in to change vacancy status.');
            navigate('/login', { state: { message: 'Please login to continue.' }});
            return;
        }
        if (!selectedStatus) {
            setError('Please select a valid status.');
            return;
        }
        try {
            await axios.post(`/api/vacancies/${vacancyId}/status/${selectedStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(`Vacancy status changed to ${selectedStatus} successfully!`);
            setNewStatus(selectedStatus); 
            fetchVacancyDetail(); 
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to change vacancy status.');
        }
    };

    if (loading) return <div style={pageStyles.loading}>Loading vacancy details...</div>;
    if (error && !vacancy) { // Critical error, vacancy data couldn't be loaded
        return (
            <div style={{textAlign: 'center', marginTop: '30px'}}>
                <p className="message-error">{error}</p>
                <Link to="/vacancies" className="button-style" style={{marginTop: '15px'}}>Back to Vacancies</Link>
            </div>
        );
    }
    if (!vacancy) return <div style={pageStyles.loading}>Vacancy not found or could not be loaded.</div>;

    return (
        <div style={pageStyles.detailCard}> {/* The main card for content */}
            {/* Page-level messages, distinct from form-specific messages if any */}
            {message && <p className="message-success">{message}</p>}
            {error && <p className="message-error">{error}</p>}

            <h1 style={pageStyles.heading}>{vacancy.name}</h1>
            
            <p style={pageStyles.infoItem}>
                <span style={pageStyles.infoLabel}>Status: </span> 
                <span style={{color: vacancy.status === 'OPEN' ? 'var(--success-green)' : 'var(--error-red)', fontWeight: 'bold'}}>
                    {vacancy.status}
                </span>
            </p>
            {vacancy.salary && (
                <p style={pageStyles.infoItem}>
                    <span style={pageStyles.infoLabel}>Salary: </span>
                    {vacancy.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
            )}
            <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Created:</span> {new Date(vacancy.created).toLocaleDateString()}</p>
            {vacancy.updated && <p style={pageStyles.infoItem}><span style={pageStyles.infoLabel}>Last Updated:</span> {new Date(vacancy.updated).toLocaleDateString()}</p>}
            
            <h2 style={pageStyles.subHeading}>Short Description</h2>
            <p style={pageStyles.description}>{vacancy.short_description}</p>

            {vacancy.full_description && (
                <>
                    <h2 style={pageStyles.subHeading}>Full Description</h2>
                    <p style={pageStyles.description}>{vacancy.full_description}</p>
                </>
            )}

            {isLoggedIn && (
                <div style={pageStyles.actionsContainer}>
                    <h2 style={pageStyles.subHeading}>Manage Vacancy</h2>
                    {!isEditing ? (
                        <button onClick={() => { setIsEditing(true); setMessage(''); setError(''); }}>Edit Vacancy</button>
                    ) : (
                        <>
                            <h3 style={{color: 'var(--text-dark)', fontSize: '1.2em', marginBottom: '10px'}}>Edit Form</h3>
                            <form onSubmit={handleUpdateSubmit} style={pageStyles.editForm}>
                                <div>
                                    <label htmlFor="name">Name*</label>
                                    <input type="text" name="name" id="name" value={editFormData.name} onChange={handleEditChange} required />
                                </div>
                                <div>
                                    <label htmlFor="salary">Salary (Optional)</label>
                                    <input type="number" name="salary" id="salary" value={editFormData.salary} onChange={handleEditChange} placeholder="e.g., 50000" step="0.01"/>
                                </div>
                                <div>
                                    <label htmlFor="short_description">Short Description*</label>
                                    <textarea name="short_description" id="short_description" value={editFormData.short_description} onChange={handleEditChange} rows="3" required />
                                </div>
                                <div>
                                    <label htmlFor="full_description">Full Description (Optional)</label>
                                    <textarea name="full_description" id="full_description" value={editFormData.full_description} onChange={handleEditChange} rows="5"/>
                                </div>
                                <div style={pageStyles.buttonGroup}>
                                    <button type="submit">Save Changes</button>
                                    <button type="button" onClick={() => { setIsEditing(false); setError(''); }} style={{backgroundColor: 'var(--text-dark)'}}>Cancel</button>
                                </div>
                            </form>
                        </>
                    )}

                    <div style={pageStyles.statusChangeContainer}>
                        <label htmlFor="status" style={pageStyles.infoLabel}>Change Status:</label>
                        <select 
                            id="status"
                            value={newStatus} 
                            onChange={(e) => {
                                setNewStatus(e.target.value); 
                                handleStatusChange(e.target.value); 
                            }}
                        >
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    
                    <button onClick={handleDelete} className="button-style" style={{backgroundColor: 'var(--error-red)', marginTop: '20px'}}>Delete Vacancy</button>
                </div>
            )}
            <Link to="/vacancies" className="button-style" style={{backgroundColor: '#6c757d', marginTop: '30px', display: 'inline-block'}}>
                Back to Vacancies
            </Link>
        </div>
    );
};

export default VacancyDetail;
