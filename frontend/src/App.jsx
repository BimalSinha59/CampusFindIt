import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import ReportItem from './pages/ReportItem';
import ItemDetail from './pages/ItemDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Navbar from './components/Navbar';
import ChatPage from './pages/ChatPage.jsx';
import MyClaims from "./pages/MyClaims.jsx";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem('user');
      }
    }
    return null; 
  });

  const [loading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} /> 
      
      <main className="min-h-screen pt-4 bg-base-200/30">
        <div className="container px-4 mx-auto md:px-0">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/item/:id" element={<ItemDetail />} />

            {/* Authenticated Routes */}
            <Route 
              path="/report" 
              element={user ? <ReportItem /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <ChatPage currentUser={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-claims" 
              element={user ? <MyClaims /> : <Navigate to="/login" />} 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;