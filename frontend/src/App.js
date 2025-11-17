import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Trading from './pages/Trading';
import MarketPage from './pages/MarketPage';
import Watchlist from './pages/Watchlist'; // <-- CORRECTED: Added the missing import

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

// Separate component to handle rendering based on auth state
function AppContent() {
    const { user } = useAuth();

    return (
        <>
            {user && <Navbar />}
            <main className={user ? "pt-16" : ""}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
                    {/* CORRECTED: Changed path to '/watchlist' to match the component */}
                    <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                    <Route path="/trading" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
                    <Route path="/trading/:symbol" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </>
    );
}

// In src/App.js

function App() {
  return (
    <AuthProvider>
      {/* CORRECTED: Added the 'future' prop to the Router */}
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;