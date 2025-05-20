import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Link } from 'react-router-dom'; // Import NavLink
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile'; // A simple profile page
import Vacancies from './pages/Vacancies'; // Import the Vacancies page
import VacancyDetail from './pages/VacancyDetail'; // Import the VacancyDetail page
import CreateVacancy from './pages/CreateVacancy'; // Import the CreateVacancy page
import NotFound from './pages/NotFound'; // Import the NotFound page
// You can also import a Home page or other components here


const App = () => {
    // Basic check for authentication token
    const isAuthenticated = !!localStorage.getItem('accessToken');

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        // Navigate to login and force re-render if necessary by changing state or using window.location
        window.location.href = '/login'; // Simple way to ensure full refresh and state clear
    };

    return (
        <Router>
            <div className="App-container"> {/* Optional: Main container for app */}
                <nav className="app-nav">
                    <div>
                        <Link to="/" className="app-nav-logo">MyApp</Link> 
                    </div>
                    <div className="app-nav-links">
                        <NavLink to="/vacancies" className={({ isActive }) => isActive ? 'active' : ''}>Vacancies</NavLink>
                        {isAuthenticated && (
                             <NavLink to="/create-vacancy" className={({ isActive }) => isActive ? 'active' : ''}>Create Vacancy</NavLink>
                        )}
                        {!isAuthenticated && (
                            <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>Register</NavLink>
                        )}
                        {isAuthenticated ? (
                            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
                        ) : (
                            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink>
                        )}
                        {isAuthenticated && (
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        )}
                    </div>
                </nav>
                <main className="page-container"> {/* Added class for consistent padding */}
                <Routes>
                    {/* Define a simple home page route if you have one */}
                    {/* <Route path="/" element={<Home />} /> */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/vacancies" element={<Vacancies />} />
                    <Route path="/vacancies/:id" element={<VacancyDetail />} />
                    <Route path="/create-vacancy" element={<CreateVacancy />} />
                    {/* Default route is Vacancies page */}
                    <Route path="/" element={<Vacancies />} /> 
                    <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
                </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
