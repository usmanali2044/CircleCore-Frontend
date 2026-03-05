import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { useProfileStore } from './stores/profileStore'
import { useWorkspaceStore } from './stores/workspaceStore'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import InviteCodePage from './pages/InviteCodePage'
import ProfileOnboardingPage from './pages/ProfileOnboardingPage'
import DashboardPage from './pages/DashboardPage'
import FeedPage from './pages/FeedPage'
import EventsPage from './pages/EventsPage'
import ModerationPage from './pages/ModerationPage'
import InviteManagementPage from './pages/InviteManagementPage'
import CreateCommunityPage from './pages/CreateCommunityPage'
import MembersPage from './pages/MembersPage'
import SuspendedPage from './pages/SuspendedPage'

// ── Route Guards ───────────────────────────────────────────────────────────

const RedirectIfAuthenticated = ({ children }) => <>{children}</>;
const ProtectedRoute = ({ children }) => <>{children}</>;
const RequireOnboarding = ({ children }) => <>{children}</>;
const AdminRoute = ({ children }) => <>{children}</>;
const AdminOrModRoute = ({ children }) => <>{children}</>;

const App = () => {
  const { checkAuth, user, isCheckingAuth } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const { initFromMemberships } = useWorkspaceStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch profile once user is loaded and invite-verified
  useEffect(() => {
    if (user?._id && user?.isInviteVerified) {
      fetchProfile(user._id);
      // Initialize workspace from memberships
      if (user.memberships?.length > 0) {
        initFromMemberships(user.memberships);
      }
    }
  }, [user, fetchProfile, initFromMemberships]);

  // Loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-warm-yellow border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Routes>
        {/* Public */}
        <Route path='/' element={<HomePage />} />

        {/* Invite — public entry point */}
        <Route path='/invite' element={<RedirectIfAuthenticated><InviteCodePage /></RedirectIfAuthenticated>} />

        {/* Auth pages — signup requires invite code in sessionStorage */}
        <Route path='/signup' element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
        <Route path='/login' element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path='/verify-email' element={<EmailVerificationPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />

        {/* Onboarding — must be logged in + invite verified */}
        <Route path='/onboarding' element={<ProtectedRoute><ProfileOnboardingPage /></ProtectedRoute>} />

        {/* Dashboard — must be logged in + invite verified + onboarded */}
        <Route path='/dashboard' element={<RequireOnboarding><DashboardPage /></RequireOnboarding>} />

        {/* Feed — must be logged in + invite verified + onboarded */}
        <Route path='/feed' element={<RequireOnboarding><FeedPage /></RequireOnboarding>} />

        {/* Events — must be logged in + invite verified + onboarded */}
        <Route path='/events' element={<RequireOnboarding><EventsPage /></RequireOnboarding>} />

        {/* Create Community — any logged-in + onboarded user */}
        <Route path='/create-community' element={<RequireOnboarding><CreateCommunityPage /></RequireOnboarding>} />

        {/* Admin Moderation — admin or moderator */}
        <Route path='/admin/moderation' element={<AdminOrModRoute><ModerationPage /></AdminOrModRoute>} />

        {/* Admin Invites — must be admin */}
        <Route path='/admin/invites' element={<AdminRoute><InviteManagementPage /></AdminRoute>} />

        {/* Admin Members — must be admin */}
        <Route path='/admin/members' element={<AdminRoute><MembersPage /></AdminRoute>} />

        {/* Suspended / Banned — accessible to any logged-in user */}
        <Route path='/suspended' element={<SuspendedPage />} />

        {/* Catch-all */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App
