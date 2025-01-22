import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { UserRole } from "../../types/supabase";

type SidebarProps = {
  userRole: UserRole | null;
  onCollapse?: (collapsed: boolean) => void;
};

export default function Sidebar({ userRole, onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  const getNavLinks = () => {
    const links = [];

    // Common links for all authenticated users
    if (userRole) {
      links.push({ to: "/dashboard", label: "Dashboard", icon: "📊" });
    }

    // Role-specific links
    switch (userRole) {
      case "CUSTOMER":
        links.push({
          to: "/create-ticket",
          label: "Create Ticket",
          icon: "➕",
        });
        break;
      case "WORKER":
        links.push(
          { to: "/all-tickets", label: "All Tickets", icon: "🎫" },
          { to: "/assigned-tickets", label: "My Assigned", icon: "📌" },
          { to: "/stats", label: "Stats", icon: "📈" }
        );
        break;
      case "ADMIN":
        links.push(
          { to: "/all-tickets", label: "All Tickets", icon: "🎫" },
          { to: "/assigned-tickets", label: "My Assigned", icon: "📌" },
          { to: "/stats", label: "Stats", icon: "📈" },
          { to: "/admin/users", label: "Users", icon: "👥" }
        );
        break;
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <div
      className={`h-screen fixed left-0 top-0 bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform ${
            isCollapsed ? "" : "rotate-180"
          }`}
        />
      </button>

      {/* Logo */}
      <div className="p-4 border-b">
        <Link
          to="/"
          className={`text-xl font-bold text-blue-600 ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          TicketAI
        </Link>
        {isCollapsed && (
          <Link to="/" className="text-xl font-bold text-blue-600">
            T
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-4">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <span className="text-xl">{link.icon}</span>
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
