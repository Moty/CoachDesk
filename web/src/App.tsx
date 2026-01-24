import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { AccessDenied } from './pages/AccessDenied';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { CreateTicket } from './pages/CreateTicket';
import { AdminUsers } from './pages/AdminUsers';
import { AdminSLARules } from './pages/AdminSLARules';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <PrivateRoute>
                <Tickets />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <PrivateRoute>
                <CreateTicket />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sla-rules"
            element={
              <PrivateRoute>
                <AdminSLARules />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
