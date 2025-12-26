import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, Tag, FileText, BookOpen, Wrench, StickyNote, Package } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { addPost } from "@/store/posts";
import { Category } from "@/types";

const categories: { value: Category; label: string; icon: any }[] = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "lab_equipment", label: "Lab Equipment", icon: Wrench },
  { value: "notes", label: "Notes", icon: StickyNote },
  { value: "other", label: "Other", icon: Package },
];

const departments = ["CSE", "EEE", "ME", "CE", "ChE", "BME", "IPE", "MME", "NAME", "WRE", "ARCH"];

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
  });

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

    setTimeout(() => {
      addPost({
        title: formData.title,
        description: formData.description,
        type: "sell",
        category: formData.category as Category,
        department: formData.department,
        price: Number(formData.price),
        imageUrl: formData.imageUrl,
        contactInfo: formData.contactInfo,
        userId: user.email,
        userName: user.name,
        userDepartment: user.department || formData.department,
      });

      toast.success("Your listing has been submitted for approval!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
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

            {/* Image Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium mb-2">Image (Optional)</label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

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
