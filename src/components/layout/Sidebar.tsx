import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserRole } from "../../types/supabase";

type SidebarProps = {
  userRole: UserRole | null;
  onCollapse?: (collapsed: boolean) => void;
};

export default function Sidebar({ userRole, onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  const getNavLinks = () => {
    const links = [];

    // Common links for all authenticated users
    if (userRole) {
      links.push({
        to: "/dashboard",
        label: t("common.dashboard"),
        icon: "📊",
      });
    }

    // Role-specific links
    switch (userRole) {
      case "CUSTOMER":
        links.push({
          to: "/knowledge-base",
          label: t("knowledgeBase.title"),
          icon: "📚",
        });
        break;
      case "WORKER":
        links.push(
          { to: "/all-tickets", label: t("ticket.allTickets"), icon: "🎫" },
          {
            to: "/assigned-tickets",
            label: t("ticket.assignedTickets"),
            icon: "📌",
          },
          { to: "/stats", label: t("common.stats"), icon: "📈" },
          {
            to: "/knowledge-base",
            label: t("knowledgeBase.title"),
            icon: "📚",
          }
        );
        break;
      case "ADMIN":
        links.push(
          { to: "/all-tickets", label: t("ticket.allTickets"), icon: "🎫" },
          {
            to: "/assigned-tickets",
            label: t("ticket.assignedTickets"),
            icon: "📌",
          },
          { to: "/stats", label: t("common.stats"), icon: "📈" },
          { to: "/admin/users", label: t("common.manageUsers"), icon: "👥" },
          {
            to: "/knowledge-base",
            label: t("knowledgeBase.title"),
            icon: "📚",
          }
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
        aria-label={t("sidebar.toggle")}
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
          {t("common.appTitle")}
        </Link>
        {isCollapsed && (
          <Link to="/" className="text-xl font-bold text-blue-600">
            {t("common.appTitle").charAt(0)}
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-4" aria-label={t("sidebar.mainNavigation")}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === link.to
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
            aria-current={location.pathname === link.to ? "page" : undefined}
          >
            <span className="text-xl" aria-hidden="true">
              {link.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
