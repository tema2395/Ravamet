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
// import ravametIcon from './assets/ravamet-icon.png'; // Original import causing error
import ravametIcon from './logo.svg'; // Using existing logo.svg to fix compilation


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
                <header className="app-header"> {/* Added header for semantic structure */}
                    <nav className="app-nav">
                        <div className="app-nav-left"> {/* Container for logo and potentially other left-aligned items */}
                            <Link to="/" className="app-nav-logo">
                                <img src={ravametIcon} alt="Ravamet Icon" className="app-logo-icon" />
                                <span className="app-logo-text">равамет</span>
                            </Link>
                            {/* Consider adding a tagline or other elements here if needed */}
                        </div>
                        <div className="app-nav-right"> {/* Container for navigation links and actions */}
                            <div className="app-nav-links">
                                <NavLink to="/vacancies" className={({ isActive }) => isActive ? 'active' : ''}>Вакансии</NavLink>
                                {isAuthenticated && (
                                    <NavLink to="/create-vacancy" className={({ isActive }) => isActive ? 'active' : ''}>Создать вакансию</NavLink>
                                )}
                                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Профиль</NavLink>
                                {/* Removed separate Profile link for authenticated users as it's always shown now */}
                            </div>
                            <div className="app-nav-actions">
                                {!isAuthenticated ? (
                                    <>
                                        <NavLink to="/login" className="button-style button-login">Войти</NavLink>
                                        <NavLink to="/register" className="button-style button-register">Регистрация</NavLink>
                                    </>
                                ) : (
                                    <button onClick={handleLogout} className="button-style button-logout">
                                        Выйти
                                    </button>
                                )}
                            </div>
                        </div>
                    </nav>
                </header>
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
