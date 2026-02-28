import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import { MainLayout, DashboardLayout, AdminLayout } from '@/layouts';

// Public Pages
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage as PublicProfilePage } from '@/pages/ProfilePage';
import { FreelancePage } from '@/pages/FreelancePage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MyProjectsPage } from '@/pages/dashboard/MyProjectsPage';
import { NewProjectPage } from '@/pages/dashboard/NewProjectPage';
import { EditProjectPage } from '@/pages/dashboard/EditProjectPage';
import { OrdersPage as MyOrdersPage } from '@/pages/dashboard/OrdersPage';
import { EarningsPage } from '@/pages/dashboard/EarningsPage';
import { ProfileSettingsPage } from '@/pages/dashboard/ProfileSettingsPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage';

// Error Pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

// Route Guards
import { ProtectedRoute, RoleRoute } from '@/components/guards';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route path="/freelance" element={<FreelancePage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/projects" element={<MyProjectsPage />} />
          <Route path="/dashboard/projects/new" element={<NewProjectPage />} />
          <Route path="/dashboard/projects/:id/edit" element={<EditProjectPage />} />
          <Route path="/dashboard/orders" element={<MyOrdersPage />} />
          <Route path="/dashboard/earnings" element={<EarningsPage />} />
          <Route path="/dashboard/profile" element={<ProfileSettingsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute roles={['super_admin', 'admin']}><AdminLayout /></RoleRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/disputes" element={<AdminDisputesPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
