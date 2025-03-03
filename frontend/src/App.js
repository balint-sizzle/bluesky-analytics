// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard";
import TrendingPage from "./components/trending";
import UserAnalyticsPage from "./components/user_analytics";

// API configuration
// const API_BASE_URL = "http://localhost:5000/api";

// Components
const Navbar = () => {
    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                    Bluesky Analytics
                </Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:underline">
                        Dashboard
                    </Link>
                    <Link to="/trending" className="hover:underline">
                        Trending
                    </Link>
                    <Link to="/user-analytics" className="hover:underline">
                        User Analytics
                    </Link>
                </div>
            </div>
        </nav>
    );
};

// Dashboard Page

// Trending Page

// User Analytics Page

// Main App Component
function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/trending" element={<TrendingPage />} />
                    <Route
                        path="/user-analytics"
                        element={<UserAnalyticsPage />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
