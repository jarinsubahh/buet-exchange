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
    // fetch pending posts from Supabase
    (async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("approved", false).order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to load pending posts", error);
        toast.error("Failed to load pending posts");
        return;
      }
      setPendingPosts(data as Post[]);
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
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        console.error("delete failed", error);
        toast.error("Failed to delete post");
        return;
      }
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post rejected and removed");
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
                <PostCard post={post} />
                
                {/* Admin Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
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
