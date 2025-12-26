import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateBuetEmail = (email: string) => {
    return email.endsWith("@gmail.com") || email.endsWith(".buet.ac.bd");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBuetEmail(formData.email)) {
      toast.error("Please use a valid BUET email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate login - replace with actual auth
    setTimeout(() => {
      // Check for admin login
      if (formData.email === "admin@buet.ac.bd" && formData.password === "admin123") {
        localStorage.setItem("user", JSON.stringify({ 
          email: formData.email, 
          name: "Admin",
          isAdmin: true 
        }));
        toast.success("Welcome back, Admin!");
        navigate("/admin");
      } else {
        // Regular user login
        localStorage.setItem("user", JSON.stringify({ 
          email: formData.email, 
          name: "Student User",
          isAdmin: false 
        }));
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <AnimatedBackground />
      
      {/* Back button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to ShareSphere</p>
        </div>

        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">BUET Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full pl-12"
                  placeholder="your.email@buet.ac.bd"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in stagger-2">
          By signing in, you agree to use this platform responsibly
        </p>
      </div>
    </div>
  );
};

export default Login;
