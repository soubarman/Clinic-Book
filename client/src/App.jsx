import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-load pages
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
const HomePage = lazy(() => import('./pages/patient/HomePage'));
const DoctorListPage = lazy(() => import('./pages/patient/DoctorListPage'));
const DoctorDetailPage = lazy(() => import('./pages/patient/DoctorDetailPage'));
const BookingHistoryPage = lazy(() => import('./pages/patient/BookingHistoryPage'));
const ClinicSignupPage = lazy(() => import('./pages/clinic/ClinicSignupPage'));
const ClinicDashboardPage = lazy(() => import('./pages/clinic/ClinicDashboardPage'));
const ManageDoctorsPage = lazy(() => import('./pages/clinic/ManageDoctorsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const ManageClinicsPage = lazy(() => import('./pages/admin/ManageClinicsPage'));
const ManageBookingsPage = lazy(() => import('./pages/admin/ManageBookingsPage'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Only for users who MUST complete their profile
function ProfileSetupRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.profileComplete === true) return <Navigate to="/" replace />;
  return children;
}

// Requires login - redirects to /login with return path
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.profileComplete === false && user.role !== 'admin') return <Navigate to="/profile-setup" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// Redirect logged-in users away from login/onboarding
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public — no auth required */}
        <Route path="/onboarding" element={<GuestOnly><OnboardingPage /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/profile-setup" element={<ProfileSetupRoute><ProfileSetupPage /></ProfileSetupRoute>} />

        {/* Publicly browsable pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />

        {/* Protected — requires login */}
        <Route path="/bookings" element={<RequireAuth><BookingHistoryPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Clinic routes */}
        <Route path="/clinic/register" element={<RequireAuth><ClinicSignupPage /></RequireAuth>} />
        <Route path="/clinic/dashboard" element={<RequireAuth role="clinic"><ClinicDashboardPage /></RequireAuth>} />
        <Route path="/clinic/doctors" element={<RequireAuth role="clinic"><ManageDoctorsPage /></RequireAuth>} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/clinics" element={<RequireAuth role="admin"><ManageClinicsPage /></RequireAuth>} />
        <Route path="/admin/bookings" element={<RequireAuth role="admin"><ManageBookingsPage /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth role="admin"><ManageUsersPage /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/' : '/onboarding'} />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '16px', fontFamily: 'Inter', fontWeight: '500' },
            duration: 3000,
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
