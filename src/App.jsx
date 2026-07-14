import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useTheme } from './hooks/useTheme';

// Pages - lazy loaded
const Home = lazy(() => import('./pages/Home'));
const BrowsePets = lazy(() => import('./pages/pet/BrowsePets'));
const PetDetail = lazy(() => import('./pages/pet/PetDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Favorites = lazy(() => import('./pages/user/Favorites'));
const MyApplications = lazy(() => import('./pages/user/MyApplications'));
const ApplicationDetail = lazy(() => import('./pages/user/ApplicationDetail'));
const Messages = lazy(() => import('./pages/user/Messages'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const Appointments = lazy(() => import('./pages/user/Appointments'));

// Shelter pages
const ShelterDashboard = lazy(() => import('./pages/shelter/ShelterDashboard'));
const CreatePet = lazy(() => import('./pages/shelter/CreatePet'));
const EditPet = lazy(() => import('./pages/shelter/EditPet'));
const ManagePets = lazy(() => import('./pages/shelter/ManagePets'));
const ShelterApplications = lazy(() => import('./pages/shelter/ShelterApplications'));
const ShelterAppDetail = lazy(() => import('./pages/shelter/ShelterAppDetail'));
const ShelterAppointments = lazy(() => import('./pages/shelter/ShelterAppointments'));
const CreateShelter = lazy(() => import('./pages/shelter/CreateShelter'));
const ShelterProfile = lazy(() => import('./pages/shelter/ShelterProfile'));

// Foster pages
const FosterDashboard = lazy(() => import('./pages/foster/FosterDashboard'));
const FosterApplications = lazy(() => import('./pages/foster/FosterApplications'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminShelters = lazy(() => import('./pages/admin/AdminShelters'));
const AdminPets = lazy(() => import('./pages/admin/AdminPets'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));

const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const dispatch = useDispatch();
  const { initializing } = useSelector((s) => s.auth);
  useTheme();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowsePets />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Authenticated user routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/appointments" element={<Appointments />} />
          </Route>
        </Route>

        {/* Shelter routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['shelter', 'admin']} />}>
            <Route path="/shelter" element={<DashboardLayout />}>
              <Route index element={<ShelterDashboard />} />
              <Route path="create-shelter" element={<CreateShelter />} />
              <Route path="profile" element={<ShelterProfile />} />
              <Route path="pets" element={<ManagePets />} />
              <Route path="pets/create" element={<CreatePet />} />
              <Route path="pets/:id/edit" element={<EditPet />} />
              <Route path="applications" element={<ShelterApplications />} />
              <Route path="applications/:id" element={<ShelterAppDetail />} />
              <Route path="appointments" element={<ShelterAppointments />} />
            </Route>
          </Route>
        </Route>

        {/* Foster routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['foster', 'admin']} />}>
            <Route path="/foster" element={<DashboardLayout />}>
              <Route index element={<FosterDashboard />} />
              <Route path="applications" element={<FosterApplications />} />
            </Route>
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="shelters" element={<AdminShelters />} />
              <Route path="pets" element={<AdminPets />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
