import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// We will create these next
import Dashboard from './pages/crm/Dashboard';
import FormView from './pages/public/FormView';
import Login from './pages/auth/Login';

// Helper to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('fiveforms_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/crm" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/f/:slug" element={<FormView />} />
      
      {/* Protected CRM Routes */}
      <Route 
        path="/crm/*" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
