import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserRole } from "../../types/supabase";
import { signOut } from "../../lib/supabase/auth";
import LanguageSwitcher from "../common/LanguageSwitcher";

type NavbarProps = {
  userRole: UserRole | null;
  userEmail?: string | null;
  hideNavigation?: boolean;
};

export default function Navbar({
  userRole,
  userEmail,
  hideNavigation,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (hideNavigation) return [];

    const links = [];

    // Common links for all authenticated users
    if (userRole) {
      links.push({ to: "/dashboard", label: t("common.dashboard") });
    }

    // Role-specific links
    switch (userRole) {
      case "CUSTOMER":
        links.push(
          { to: "/my-tickets", label: t("ticket.myTickets") },
          { to: "/create-ticket", label: t("ticket.create") }
        );
        break;
      case "WORKER":
        links.push(
          { to: "/all-tickets", label: t("ticket.allTickets") },
          { to: "/assigned-tickets", label: t("ticket.assignedTickets") },
          { to: "/stats", label: t("common.stats") }
        );
        break;
      case "ADMIN":
        links.push(
          { to: "/all-tickets", label: t("ticket.allTickets") },
          { to: "/assigned-tickets", label: t("ticket.assignedTickets") },
          { to: "/stats", label: t("common.stats") },
          { to: "/admin/users", label: t("common.manageUsers") }
        );
        break;
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            {!hideNavigation && (
              <>
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    {t("common.appTitle")}
                  </Link>
                </div>
                {/* Desktop Navigation */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-600"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {userRole && (
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <div className="flex items-center space-x-4">
                  {/* Language Switcher */}
                  <div className="w-32">
                    <LanguageSwitcher />
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <User className="h-5 w-5 mr-1" />
                    {userEmail}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    {t("auth.signOut")}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu button - only show if navigation is enabled */}
            {!hideNavigation && (
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                  aria-expanded="false"
                >
                  <span className="sr-only">{t("common.openMenu")}</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - only show if navigation is enabled */}
      {!hideNavigation && (
        <div className={`sm:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {userRole && (
              <>
                {/* Language Switcher in mobile menu */}
                <div className="px-3 py-2">
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  {t("auth.signOut")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
