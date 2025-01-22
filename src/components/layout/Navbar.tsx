import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import type { UserRole } from "../../types/supabase";
import { signOut } from "../../lib/supabase/auth";

type NavbarProps = {
  userRole: UserRole | null;
  userEmail?: string | null;
};

export default function Navbar({ userRole, userEmail }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getNavLinks = () => {
    const links = [];

    // Common links for all authenticated users
    if (userRole) {
      links.push({ to: "/dashboard", label: "Dashboard" });
    }

    // Role-specific links
    switch (userRole) {
      case "CUSTOMER":
        links.push(
          { to: "/my-tickets", label: "My Tickets" },
          { to: "/create-ticket", label: "Create Ticket" }
        );
        break;
      case "WORKER":
        links.push(
          { to: "/all-tickets", label: "All Tickets" },
          { to: "/assigned-tickets", label: "My Assigned Tickets" },
          { to: "/stats", label: "Stats" }
        );
        break;
      case "ADMIN":
        links.push(
          { to: "/all-tickets", label: "All Tickets" },
          { to: "/assigned-tickets", label: "My Assigned Tickets" },
          { to: "/stats", label: "Stats" },
          { to: "/admin/users", label: "Manage Users" }
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
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                AutoCRM
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
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            {userRole && (
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <User className="h-5 w-5 mr-1" />
                    {userEmail}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
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
            <button
              onClick={handleSignOut}
              className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
