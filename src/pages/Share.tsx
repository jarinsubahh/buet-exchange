import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, Gift, FileText, BookOpen, Wrench, StickyNote, Package, Heart } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { addPost } from "@/store/posts";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";

const categories: { value: Category; label: string; icon: any }[] = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "lab_equipment", label: "Lab Equipment", icon: Wrench },
  { value: "notes", label: "Notes", icon: StickyNote },
  { value: "other", label: "Other", icon: Package },
];

const departments = ["CSE", "EEE", "ME", "CE", "ChE", "BME", "IPE", "MME", "NAME", "WRE", "ARCH"];

const Share = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as Category | "",
    department: "",
    contactInfo: "",
    imageUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData((prev) => ({
      ...prev,
      department: parsedUser.department || "",
      contactInfo: parsedUser.phone || parsedUser.email || "",
    }));
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const session = JSON.parse(localStorage.getItem("sb-session") || "null");
        const authUser = session?.user;

        // create post row as pending
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert([
            {
              seller_id: authUser?.id ?? null,
              type: "free",
              category: formData.category,
              title: formData.title,
              description: formData.description,
              contact: formData.contactInfo,
              dept: formData.department || null,
              approved: false,
              sold_out: false,
              is_free: true,
            },
          ])
          .select()
          .maybeSingle();

        if (postError || !post) {
          console.error("share post insert error", postError);
          toast.error("Failed to create post");
          setIsLoading(false);
          return;
        }

        // upload image if present
        if (file) {
          const filePath = `${authUser?.id ?? "anon"}/${post.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(filePath);
          const publicUrl = publicUrlData?.publicUrl || null;
          const { error: imgErr } = await supabase.from("post_images").insert([{ post_id: post.id, storage_path: filePath, url: publicUrl }]);
          if (imgErr) throw imgErr;
        }

        toast.success("Your free resource has been submitted for approval!");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit. Try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    setFile(f);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <Logo size="sm" showText={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Heart className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent">Share for Free</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Donate Your Resources</h1>
          <p className="text-muted-foreground">Share your resources with juniors and help them succeed</p>
        </div>

        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                      formData.category === cat.value
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <cat.icon className={`w-6 h-6 ${formData.category === cat.value ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., Digital Logic Design Notes"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full min-h-[120px] resize-none"
                placeholder="Describe what you're sharing and how it can help others..."
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field w-full appearance-none cursor-pointer"
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium mb-2">Contact Information</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="input-field w-full"
                placeholder="Phone number or email"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Image (Optional)</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                {file && <p className="text-xs text-muted-foreground mt-2">Selected: {file.name}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Share for Free"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Your donation will be reviewed by an admin before it appears publicly
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Share;
