import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Vacancies = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20; // Or get from API if dynamic

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // e.g., 'OPEN', 'CLOSED'

    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is logged in (basic check)
    const isAuthenticated = !!localStorage.getItem('accessToken');

    // Refined styles, leveraging global styles
    const pageStyles = {
        headerContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap', // Allow wrapping for smaller screens
        },
        heading: {
            color: 'var(--corporate-red)',
            margin: '0', // Remove default margins from h1
        },
        filtersContainer: {
            display: 'flex',
            gap: '10px', // Space between filter elements
            padding: '15px',
            backgroundColor: 'var(--background-card)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            marginBottom: '25px',
            flexWrap: 'wrap', // Allow filters to wrap
            alignItems: 'center',
        },
        filterInput: { // Specific style for filter input if needed, else global takes over
            minWidth: '200px', // Ensure it has some width
        },
        list: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Slightly wider cards
            gap: '25px',
        },
        // listItem is now .card from index.css
        listItemTitle: { // Replaces listItemLink for styling the title
            fontSize: '1.4em', // Larger title
            fontWeight: 'bold',
            color: 'var(--corporate-red)',
            textDecoration: 'none', // Remove underline from Link
            display: 'block', // Make it block to allow margin bottom
            marginBottom: '8px',
        },
        listItemDescription: {
            fontSize: '0.95rem',
            color: 'var(--text-dark)',
            marginBottom: '10px',
            lineHeight: '1.5',
        },
        listItemSalary: {
            fontSize: '1rem',
            color: 'var(--text-dark)',
            fontWeight: 'bold',
            marginBottom: '8px',
        },
        listItemStatus: {
            fontSize: '0.85rem',
            color: 'var(--text-light)',
            padding: '4px 10px',
            borderRadius: 'var(--border-radius)',
            display: 'inline-block',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        paginationContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '35px',
            padding: '10px',
        },
        pageInfo: {
            margin: '0 20px', // More space around page info
            fontSize: '1rem',
            color: 'var(--text-dark)',
        },
        message: { // For "Loading...", "No vacancies..."
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--text-dark)',
            padding: '30px',
        },
        // createButton uses global .button-style
        // error messages use global .message-error
    };
    
    // Debounce function remains the same
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const fetchVacancies = useCallback(async (page, search, status) => {
        setLoading(true);
        setError('');
        try {
            const params = { page, per_page: itemsPerPage };
            if (search) params.search = search;
            if (status) params.status = status;

            const query = new URLSearchParams(location.search);
            query.set('page', page.toString());
            if (search) query.set('search', search); else query.delete('search');
            if (status) query.set('status', status); else query.delete('status');
            navigate(`${location.pathname}?${query.toString()}`, { replace: true });
            
            const response = await axios.get('/api/vacancies/', { params }); // Ensure endpoint is correct
            
            setVacancies(response.data.items || []);
            setCurrentPage(response.data.page || 1);
            setTotalPages(response.data.pages || 0); // Assuming API provides 'pages'
            setTotalItems(response.data.total || 0); // Assuming API provides 'total'

        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch vacancies. Please try again.');
            setVacancies([]);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, navigate, location.pathname, location.search]); // location.search was missing
    
    // Effect for initial load and when filters/page change via URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = parseInt(queryParams.get('page')) || 1;
        const search = queryParams.get('search') || '';
        const status = queryParams.get('status') || '';

        setCurrentPage(page);
        setSearchTerm(search);
        setStatusFilter(status);
        
        fetchVacancies(page, search, status);
    }, [location.search, fetchVacancies]);


    const debouncedFetchVacancies = useCallback(debounce(fetchVacancies, 500), [fetchVacancies]);

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        debouncedFetchVacancies(1, newSearchTerm, statusFilter);
    };

    const handleStatusChange = (e) => {
        const newStatusFilter = e.target.value;
        setStatusFilter(newStatusFilter);
        fetchVacancies(1, searchTerm, newStatusFilter);
    };
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        fetchVacancies(1, '', '');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchVacancies(newPage, searchTerm, statusFilter);
        }
    };

    if (loading) {
        return <div style={pageStyles.message}>Loading vacancies...</div>;
    }

    return (
        <div> {/* Main container is now .page-container from App.js */}
            <div style={pageStyles.headerContainer}>
                <h1 style={pageStyles.heading}>Available Vacancies ({totalItems})</h1>
                {isAuthenticated && (
                    <Link to="/create-vacancy" className="button-style"> {/* Uses global .button-style */}
                        Create New Vacancy
                    </Link>
                )}
            </div>

            <div style={pageStyles.filtersContainer}>
                <input
                    type="text"
                    placeholder="Search by name, description..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={pageStyles.filterInput} // Uses global input style, can add specific overrides
                />
                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    // style attribute for select will use global styles by default
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <button onClick={handleClearFilters} className="button-style" style={{backgroundColor: 'var(--text-dark)'}}> {/* Overriding button color for clear */}
                    Clear Filters
                </button>
            </div>

            {error && <p className="message-error">{error}</p>}

            {vacancies.length === 0 && !loading && !error && (
                <p style={pageStyles.message}>No vacancies found matching your criteria.</p>
            )}

            <div style={pageStyles.list}>
                {vacancies.map(vacancy => (
                    <div key={vacancy.id} className="card"> {/* Using global .card style */}
                        <Link to={`/vacancies/${vacancy.id}`} style={pageStyles.listItemTitle}>
                            {vacancy.name}
                        </Link>
                        <p style={pageStyles.listItemDescription}>{vacancy.short_description}</p>
                        {vacancy.salary && (
                            <p style={pageStyles.listItemSalary}>
                                Salary: {vacancy.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                        )}
                        <p>
                            <span style={{
                                ...pageStyles.listItemStatus, 
                                backgroundColor: vacancy.status === 'OPEN' ? 'var(--success-green)' : 'var(--error-red)' 
                            }}>
                                {vacancy.status}
                            </span>
                        </p>
                        <p style={{fontSize: '0.8rem', color: '#777', marginTop: '10px'}}>
                            Created: {new Date(vacancy.created).toLocaleDateString()}
                        </p>
                         <Link to={`/vacancies/${vacancy.id}`} className="button-style" style={{marginTop: '15px'}}>
                            View Details
                        </Link>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={pageStyles.paginationContainer}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        // Global button styles apply
                    >
                        Previous
                    </button>
                    <span style={pageStyles.pageInfo}>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                         // Global button styles apply
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Vacancies;
