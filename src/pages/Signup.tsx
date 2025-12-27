import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Building2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { supabase } from "../lib/supabase";

const departments = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "EEE", label: "Electrical & Electronic Engineering" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "CE", label: "Civil Engineering" },
  { value: "ChE", label: "Chemical Engineering" },
  { value: "BME", label: "Biomedical Engineering" },
  { value: "IPE", label: "Industrial & Production Engineering" },
  { value: "MME", label: "Materials & Metallurgical Engineering" },
  { value: "NAME", label: "Naval Architecture & Marine Engineering" },
  { value: "WRE", label: "Water Resources Engineering" },
  { value: "ARCH", label: "Architecture" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    level: "",
    term: "",
    phone: "",
  });

  const isArchitecture = formData.department === "ARCH";
  const maxLevel = isArchitecture ? 5 : 4;
  const maxTerm = isArchitecture ? 10 : 8;

  const validateBuetEmail = (email: string) => {
    return email.endsWith("@gmail.com") || email.endsWith(".buet.ac.bd");
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateBuetEmail(formData.email)) {
  //     toast.error("Please use a valid BUET email address (.buet.ac.bd)");
  //     return;
  //   }

  //   if (formData.password !== formData.confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }

  //   if (formData.password.length < 6) {
  //     toast.error("Password must be at least 6 characters");
  //     return;
  //   }

  //   if (!formData.department || !formData.level || !formData.term) {
  //     toast.error("Please select department, level and term");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     // Create auth user
  //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  //       email: formData.email,
  //       password: formData.password,
  //       options: {
  //         data: {
  //           name: formData.name,
  //         },
  //       },
  //     });

  //     if (signUpError) {
  //       toast.error(signUpError.message || "Sign up failed");
  //       setIsLoading(false);
  //       return;
  //     }

  //     const authUser = signUpData.user;
  //     if (!authUser) {
  //       toast.error("Sign up did not return a user. Try again.");
  //       setIsLoading(false);
  //       return;
  //     }

  //     // Insert profile into `users` table (use same id as auth user)
  //     const { error: insertError } = await supabase.from("users").insert([
  //       {
  //         id: authUser.id,
  //         name: formData.name,
  //         contact: formData.phone,
  //         dept: formData.department,
  //         level: formData.level,
  //         term: formData.term,
  //         role: "user",
  //       },
  //     ]);

  //     if (insertError) {
  //       console.error("Profile insert error:", insertError);
  //       toast.error("Account created but failed to save profile. Contact admin.");
  //       // Still redirect to login so user can sign in (profile may be recoverable)
  //       navigate("/login");
  //       setIsLoading(false);
  //       return;
  //     }

  //     toast.success("Account created successfully! Please sign in.");
  //     navigate("/login");
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Unexpected error";
  //     toast.error(message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateBuetEmail(formData.email)) {
    toast.error("Please use a valid BUET email address (.buet.ac.bd)");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (formData.password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  if (!formData.department || !formData.level || !formData.term) {
    toast.error("Please select department, level and term");
    return;
  }

  setIsLoading(true);

    try {
      // 1️⃣ Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        toast.error(error.message || "Sign up failed");
        setIsLoading(false);
        return;
      }

      const authUser = data.user;
      if (!authUser) {
        toast.error("Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // If signUp returned a session the client is authenticated and can write to users.
      // Otherwise most projects require email confirmation and there will be no session.
      if (data.session) {
        const { error: upsertError } = await supabase
          .from("users")
          .upsert(
            [
              {
                id: authUser.id,
                email: formData.email,
                name: formData.name,
                contact: formData.phone,
                dept: formData.department,
                level: Number(formData.level) || null,
                term: Number(formData.term) || null,
                role: "user",
              },
            ],
            { onConflict: "id" }
          );

        if (upsertError) {
          console.error("Profile upsert error:", upsertError);
          toast.error("Account created but failed to save profile. Contact admin.");
          setIsLoading(false);
          navigate("/login");
          return;
        }

        toast.success("Account created and profile saved! Redirecting...");
        navigate("/dashboard");
      } else {
        // No session — probably email confirmation required
        toast.success("Account created. Please check your email to confirm, then sign in.");
        navigate("/login");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-12">
      <AnimatedBackground />

      <Link
        to="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Join the BUET community on ShareSphere</p>
        </div>

        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full pl-12"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

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
              <p className="text-xs text-muted-foreground mt-1">Must use BUET email for verification</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, level: "", term: "" })}
                  className="input-field w-full pl-12 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select your department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="input-field w-full pl-12 appearance-none cursor-pointer"
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Level</option>
                    {Array.from({ length: maxLevel }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Level {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="input-field w-full appearance-none cursor-pointer"
                  required
                  disabled={!formData.department}
                >
                  <option value="">Term</option>
                  {Array.from({ length: maxTerm }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Term {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full pl-12"
                  placeholder="+880 1XXX-XXXXXX"
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

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field w-full pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;