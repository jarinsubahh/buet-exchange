import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Check, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    // fetch pending posts and user info from Supabase
    (async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("approved", false).order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to load pending posts", error);
        toast.error("Failed to load pending posts");
        return;
      }

      const sellerIds = Array.from(new Set((data || []).flatMap((p: any) => [p.seller_id, p.user_id]).filter(Boolean)));
      let usersMap: Record<string, any> = {};
      if (sellerIds.length) {
        const { data: usersData } = await supabase.from("users").select("id, name, dept, contact, email").in("id", sellerIds);
        usersMap = (usersData || []).reduce((acc: any, u: any) => ({ ...acc, [u.id]: u }), {});
      }

      const mapped: Post[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: (p.is_free ? "free" : p.type) as Post['type'],
        category: p.category as Post['category'],
        department: p.dept,
        price: p.price,
        imageUrl: p.image_url ?? null,
        fileUrl: p.file_url ?? null,
        isPdf: p.is_pdf ?? false,
        contactInfo: p.contact,
        userId: usersMap[p.seller_id]?.email ?? usersMap[p.user_id]?.email ?? p.seller_id ?? p.user_id,
        userName: usersMap[p.seller_id]?.name ?? usersMap[p.user_id]?.name ?? p.name ?? "Student User",
        userDepartment: usersMap[p.seller_id]?.dept ?? usersMap[p.user_id]?.dept ?? p.dept,
        status: (p.sold_out ? "sold" : p.rejected ? "rejected" : p.approved ? "approved" : "pending") as Post['status'],
        createdAt: p.created_at,
      }));

      setPendingPosts(mapped);
    })();
  }, [navigate]);

  const handleApprove = (postId: string) => {
    (async () => {
      const { error } = await supabase.from("posts").update({ approved: true, updated_at: new Date() }).eq("id", postId);
      if (error) {
        console.error("approve failed", error);
        toast.error("Failed to approve post");
        return;
      }
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post approved and published!");
    })();
  };

  const handleReject = (postId: string) => {
    (async () => {
      const { error } = await supabase
        .from("posts")
        .update({ approved: false, rejected: true, updated_at: new Date() })
        .eq("id", postId);

      if (error) {
        console.error("reject failed", error);
        // detect likely missing column error and give actionable guidance
        const msg = (error as any)?.message || String(error);
        if (msg.toLowerCase().includes("column \"rejected\"" ) || msg.toLowerCase().includes("unrecognized column")) {
          const help = `Your database does not have a boolean column named 'rejected' on the posts table. Run this SQL in Supabase SQL editor to add it:\n\nALTER TABLE public.posts ADD COLUMN rejected boolean DEFAULT false;\n\nThen retry rejecting the post from the admin UI.`;
          console.error(help);
          toast.error("Failed to reject post: DB missing 'rejected' column. See console for SQL to add it.");
          return;
        }

        toast.error("Failed to reject post");
        return;
      }

      // remove from pending list but keep in DB marked as rejected so seller still sees it
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post rejected (kept in seller profile)");
    })();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve posts before they appear on the dashboard
          </p>
        </div>

        {pendingPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {pendingPosts.map((post) => (
              <div key={post.id} className="glass-card p-6">
                <PostCard post={post} showAccess={false} />

                <div className="mt-4 pt-4 border-t border-border flex gap-3">
                  <Link
                    to={`/access/${post.id}`}
                    className="flex-1 text-center py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    Access
                  </Link>

                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-success/20 text-green-400 hover:bg-success/30 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no pending posts to review at the moment
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
