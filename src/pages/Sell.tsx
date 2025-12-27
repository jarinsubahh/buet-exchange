import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Tag, FileText, BookOpen, Wrench, StickyNote, Package } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { addPost } from "@/store/posts";
import { supabase } from "../lib/supabase";
import { Category } from "@/types";

const categories: { value: Category; label: string; icon: any }[] = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "lab_equipment", label: "Lab Equipment", icon: Wrench },
  { value: "notes", label: "Notes", icon: StickyNote },
  { value: "other", label: "Other", icon: Package },
];

const departments = ["CSE", "EEE", "ME", "CE", "ChE", "BME", "IPE", "MME", "NAME", "WRE", "ARCH", "NCE", "URP"];

const Sell = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as Category | "",
    department: "",
    price: "",
    contactInfo: "",
    imageUrl: "",
    fileUrl: "",
  });
  // no image uploads anymore

  // images removed — simplified form

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

  // no storage uploads

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);

    try {
      // get auth user id from stored session
      const session = JSON.parse(localStorage.getItem("sb-session") || "null");
      const authUser = session?.user;
      if (!authUser) {
        toast.error("Not authenticated");
        setIsLoading(false);
        return;
      }

      // create post as draft
      const payload: any = {
        seller_id: authUser.id,
        type: "sell",
        category: formData.category,
        title: formData.title,
        description: formData.description,
        price: formData.price ? Number(formData.price) : null,
        contact: formData.contactInfo,
        dept: formData.department || null,
        approved: false,
        sold_out: false,
        is_free: false,
      };

      if (formData.fileUrl) {
        payload.file_url = formData.fileUrl;
        payload.is_pdf = formData.fileUrl.toLowerCase().endsWith(".pdf") || formData.category === "pdf";
      }

      console.debug("Creating post with payload", { authUserId: authUser.id, payload });

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([payload])
        .select()
        .maybeSingle();

      if (postError || !post) {
        console.error("post insert error", postError);
        // debug full shape
        try {
          console.error("post insert debug", {
            status: (postError as any)?.status,
            code: (postError as any)?.code,
            message: (postError as any)?.message,
            details: (postError as any)?.details,
            hint: (postError as any)?.hint,
            payload,
          });
        } catch (ex) {
          console.error("failed to stringify postError", ex);
        }
        // show more info to help debugging
        try {
          const msg = (postError as any)?.message || JSON.stringify(postError);
          const details = (postError as any)?.details || (postError as any)?.hint || null;
          toast.error(`Post create failed: ${msg}${details ? ' — ' + details : ''}`);
        } catch (e) {
          toast.error("Failed to create post");
        }
        setIsLoading(false);
        return;
      }

      // mark post available (no images)
      try {
        await supabase.from("posts").update({ updated_at: new Date() }).eq("id", post.id);

        // update local store for offline demo
        addPost({
          title: formData.title,
          description: formData.description,
          type: "sell",
          category: formData.category as Category,
          department: formData.department,
          price: Number(formData.price),
          imageUrl: formData.imageUrl,
          fileUrl: formData.fileUrl,
          contactInfo: formData.contactInfo,
          userId: user.email,
          userName: user.name,
          userDepartment: user.department || formData.department,
        });

        toast.success("Your listing has been submitted for approval!");
        navigate("/dashboard");
      } catch (err) {
        console.error("finalizing post error", err);
        // delete post
        await supabase.from("posts").delete().eq("id", post.id);
        toast.error("Failed to save post. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Sell Resources</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">List Your Item for Sale</h1>
          <p className="text-muted-foreground">Help fellow BUETians and earn from your resources</p>
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
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <cat.icon className={`w-6 h-6 ${formData.category === cat.value ? "text-primary" : "text-muted-foreground"}`} />
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
                placeholder="e.g., Engineering Mathematics Textbook"
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
                placeholder="Describe the condition, edition, and any other relevant details..."
                required
              />
            </div>

            {/* Department and Price */}
            <div className="grid sm:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium mb-2">Price (৳)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., 500"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Resource URL */}
            <div>
              <label className="block text-sm font-medium mb-2">Resource URL (image or PDF)</label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="input-field w-full"
                placeholder="https://example.com/resource.pdf or image URL"
              />
              <p className="text-xs text-muted-foreground mt-1">Provide a direct URL to a PDF or an image. We won't host files; seller provides URLs.</p>
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

            {/* Images removed: only description/contact now */}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit for Approval"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Your listing will be reviewed by an admin before it appears publicly
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Sell;
