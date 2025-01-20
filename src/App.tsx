import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import AllTicketsPage from "./pages/AllTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "WORKER", "ADMIN"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/create-ticket"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CreateTicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        {/* Worker/Admin routes */}
        <Route
          path="/all-tickets"
          element={
            <ProtectedRoute allowedRoles={["WORKER", "ADMIN"]}>
              <AllTicketsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/ticket/:ticketId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "WORKER", "ADMIN"]}>
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
