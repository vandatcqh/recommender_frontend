import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import MyRatingsPage from './pages/MyRatingsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminExportsPage from './pages/AdminExportsPage';
import AdminRecommenderPage from './pages/AdminRecommenderPage';
import AdminRecommenderMetricsPage from './pages/AdminRecommenderMetricsPage';
import { isAdmin } from './lib/auth';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Be Vietnam Pro', sans-serif",
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/category/:slug" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        <Route path="/my-ratings" element={<ProtectedRoute><MyRatingsPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route
          path="/admin/exports"
          element={
            <ProtectedRoute>
              <AdminExportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recommender/:version"
          element={<AdminRecommenderPage />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminRecommenderMetricsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/recommender-metrics"
          element={<Navigate to="/admin" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
