import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../lib/admin";
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
    // Quick hardcoded admin signin (no email confirmation)
    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      const localAdmin = {
        id: "admin-local",
        email: ADMIN_EMAIL,
        name: "Administrator",
        phone: null,
        department: null,
        role: "admin",
        isAdmin: true,
      };
      // store session stub and user
      localStorage.setItem("sb-session", JSON.stringify({ provider_token: "admin-local-session" }));
      localStorage.setItem("user", JSON.stringify(localAdmin));
      toast.success("Welcome back, Admin!");
      setIsLoading(false);
      navigate("/admin");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message || "Sign in failed");
        setIsLoading(false);
        return;
      }

      const user = data.user;
      const session = data.session;

      if (!user || !session) {
        toast.error("Sign in did not return a session. Check your email verification flow.");
        setIsLoading(false);
        return;
      }

        // NOTE: removed automatic `users` upsert because DB constraint was dropped.
        // If you re-enable the FK to `public.users`, consider adding a server-side
        // trigger or fixing RLS so clients can upsert safely.

      // fetch profile from your `users` table (contact, dept, level, term, role, name)
      const { data: userRow, error: userRowError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (userRowError) {
        console.warn("Could not read user row:", userRowError);
      }

      const localUser = {
        id: user.id,
        email: user.email ?? formData.email,
        name:
          userRow?.name ??
          (user.user_metadata && (user.user_metadata as any).name) ??
          "Student User",
        phone:
          userRow?.contact ??
          (user.user_metadata && (user.user_metadata as any).phone) ??
          null,
        department: userRow?.dept ?? null,
        level: userRow?.level ?? null,
        term: userRow?.term ?? null,
        role: userRow?.role ?? "user",
        isAdmin: (userRow?.role ?? "user") === "admin",
      };

      // Persist session + user for app UI
      localStorage.setItem("sb-session", JSON.stringify(session));
      localStorage.setItem("user", JSON.stringify(localUser));

      toast.success(localUser.role === "admin" ? "Welcome back, Admin!" : "Welcome back!");
      if (localUser.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <AnimatedBackground />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
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