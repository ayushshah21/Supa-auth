import {
  ChevronRight,
  MessageSquare,
  Users,
  Brain,
  BarChart3,
  Zap,
  Shield,
  Code,
  Moon,
  Sun,
} from "lucide-react";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Theme Toggle Component
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <button
      className="inline-flex items-center justify-center rounded-md p-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

// Data
const features = [
  {
    title: "Ticket Management",
    description:
      "Efficiently handle customer inquiries with our advanced ticketing system.",
    icon: MessageSquare,
  },
  {
    title: "Team Collaboration",
    description:
      "Unite your team with real-time collaboration tools and shared workspaces.",
    icon: Users,
  },
  {
    title: "AI-Driven Insights",
    description:
      "Leverage AI to predict trends and automate customer responses.",
    icon: Brain,
  },
  {
    title: "Analytics & Reporting",
    description:
      "Make data-driven decisions with comprehensive analytics dashboards.",
    icon: BarChart3,
  },
];

const additionalFeatures = [
  {
    title: "Retro-Inspired UI",
    description:
      "Experience the perfect blend of classic design and modern functionality.",
    icon: Code,
  },
  {
    title: "Lightning Fast",
    description:
      "Optimized performance for quick response times and smooth interactions.",
    icon: Zap,
  },
  {
    title: "Enterprise Security",
    description:
      "Bank-grade encryption and security measures to protect your data.",
    icon: Shield,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, Trendy Threads",
    content:
      "This CRM has transformed how we handle customer service. The AI insights are game-changing!",
  },
  {
    name: "Michael Chen",
    role: "CEO, Fashion Forward",
    content:
      "The team collaboration features have helped us scale our operations seamlessly.",
  },
  {
    name: "Emma Williams",
    role: "Manager, Style Studio",
    content:
      "The analytics tools give us clear insights into customer behavior and trends.",
  },
];

const pricing = [
  {
    title: "Basic",
    price: "$29",
    features: ["5 team members", "Basic reporting", "Ticket management"],
  },
  {
    title: "Professional",
    price: "$79",
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "AI-powered insights",
      "Priority support",
    ],
  },
  {
    title: "Enterprise",
    price: "Custom",
    features: [
      "Custom solutions",
      "Dedicated support",
      "Advanced integrations",
      "Custom AI training",
    ],
  },
];

// Main Landing Page Component
export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#EA384D]">MyClothCRM</div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="hover:text-[#EA384D] transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="hover:text-[#EA384D] transition-colors font-medium"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="hover:text-[#EA384D] transition-colors font-medium"
              >
                Pricing
              </a>
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-[#EA384D] hover:bg-[#EA384D]/90 rounded-md text-white font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Reinvent Your Clothing Business
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Manage tickets, engage customers, and boost sales with AI-driven
              insights
            </p>
            <button
              onClick={() => navigate("/register")}
              className="animate-fadeIn bg-[#EA384D] hover:bg-[#EA384D]/90 px-8 py-3 rounded-md text-white font-medium flex items-center justify-center mx-auto"
            >
              Get Started Now
              <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#EA384D] to-purple-500 bg-clip-text text-transparent">
            Powerful Features for Modern Retail
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...features, ...additionalFeatures].map((feature) => (
              <div
                key={feature.title}
                className="animate-on-scroll bg-black/40 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:border-[#EA384D]/50 transition-all"
              >
                <feature.icon className="w-12 h-12 text-[#EA384D] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#EA384D] to-purple-500 bg-clip-text text-transparent">
            Trusted by Fashion Leaders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="animate-on-scroll bg-black/40 backdrop-blur-md p-6 rounded-lg border border-white/10"
              >
                <p className="text-white text-lg mb-4 font-medium">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-[#EA384D] font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#EA384D] to-purple-500 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className="animate-on-scroll bg-black/40 backdrop-blur-md p-8 rounded-lg border border-white/10 hover:border-[#EA384D]/50 transition-all"
              >
                <h3 className="text-2xl font-bold mb-2 text-white">
                  {plan.title}
                </h3>
                <p className="text-4xl font-bold text-[#EA384D] mb-6">
                  {plan.price}
                  {plan.price !== "Custom" && (
                    <span className="text-lg text-gray-300">/mo</span>
                  )}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-white font-medium"
                    >
                      <ChevronRight className="w-5 h-5 text-[#EA384D] mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/register")}
                  className={`w-full py-3 rounded-md font-bold transition-colors ${
                    plan.title === "Professional"
                      ? "bg-[#EA384D] hover:bg-[#EA384D]/90 text-white"
                      : "bg-black/50 hover:bg-black/70 text-white border border-white/20"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold text-[#EA384D] mb-4">
                MyClothCRM
              </h3>
              <p className="text-white font-medium">
                Next-generation CRM for fashion retailers
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#EA384D] mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#EA384D] mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#EA384D] mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-[#EA384D] font-medium"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white font-medium">
            © 2024 MyClothCRM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
