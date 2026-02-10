import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ChatWidget from './components/ChatWidget';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Policies from './pages/Policies';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PolicyDetail from './pages/PolicyDetail';

import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Support from './pages/Support';
import './index.css';

import { authHelpers } from './services/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Supabase automatically handles session persistence
        const { session, error } = await authHelpers.getSession();

        if (error) {
          console.error("Session error:", error);
          setUser(null);
        } else if (session?.user) {
          // Extract user data from Supabase session
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            role: session.user.user_metadata?.role || 'user',
            ...session.user.user_metadata
          };
          console.log("Restored User Session:", userData);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await authHelpers.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <Router>
            <div className="relative min-h-screen">
              {/* Animated Background */}
              <AnimatedBackground />

              {/* Main Content */}
              <div className="relative z-20">
                <Navbar user={user} onLogout={handleLogout} />

                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/policy/:id" element={<PolicyDetail />} />
                    <Route
                      path="/login"
                      element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />}
                    />
                    <Route
                      path="/register"
                      element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />}
                    />
                    <Route
                      path="/dashboard"
                      element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/my-applications"
                      element={user ? <MyApplications /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/profile"
                      element={user ? <Profile user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/support"
                      element={user ? <Support /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/admin"
                      element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />}
                    />
                  </Routes>
                </main>
                <ChatWidget />
              </div>
            </div>
          </Router>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
