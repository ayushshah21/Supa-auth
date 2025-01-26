import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../components/AnimatedBackground";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password");
      } else {
        setError(error.message);
      }
    } else if (data?.user) {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <AnimatedBackground />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-[#EA384D] to-purple-500 bg-clip-text text-transparent">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-400 bg-red-900/50 backdrop-blur-md rounded-lg border border-red-500/50">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form
          className="mt-8 space-y-6 bg-black/40 backdrop-blur-md p-8 rounded-lg border border-white/10"
          onSubmit={handleEmailLogin}
        >
          <div className="rounded-md space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-12 py-3 bg-black/50 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#EA384D] focus:border-transparent transition-colors"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-12 py-3 bg-black/50 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#EA384D] focus:border-transparent transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#EA384D] hover:bg-[#EA384D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA384D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={20}
              />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex justify-center py-3 px-4 border border-white/10 rounded-lg bg-black/40 backdrop-blur-md text-sm font-medium text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA384D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <img
              className="h-5 w-5"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
            />
            <span className="ml-2">Sign in with Google</span>
          </button>
        </div>

        <p className="mt-2 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-[#EA384D] hover:text-[#EA384D]/90 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
