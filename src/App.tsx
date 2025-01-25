import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import AllTicketsPage from "./pages/AllTicketsPage";
import AssignedTicketsPage from "./pages/AssignedTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import TeamsPage from "./pages/TeamsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Knowledge Base - accessible to all users */}
        <Route
          path="/knowledge-base"
          element={
            <Layout>
              <KnowledgeBasePage />
            </Layout>
          }
        />

        {/* Protected routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Profile route - accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <Layout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Customer routes */}
        <Route
          path="/create-ticket"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CreateTicketPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyTicketsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Worker/Admin routes */}
        <Route
          path="/all-tickets"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["WORKER", "ADMIN"]}>
                <AllTicketsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/assigned-tickets"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["WORKER", "ADMIN"]}>
                <AssignedTicketsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/ticket/:ticketId"
          element={
            <Layout>
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/teams"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["WORKER", "ADMIN"]}>
                <TeamsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <Layout>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ManageUsersPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Add this inside the Routes component, with the other protected routes */}
        <Route
          path="/stats"
          element={
            <ProtectedRoute allowedRoles={["WORKER", "ADMIN"]}>
              <Layout>
                <StatsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
