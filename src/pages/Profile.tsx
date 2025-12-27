import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Building2, GraduationCap, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase";
import { getPostsByUser, updatePostStatus, getPosts, savePosts } from "@/store/posts";
import { Post } from "@/types";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    // fetch user's posts from Supabase
    (async () => {
      try {
        const { data, error } = await supabase.from("posts").select("*").eq("seller_id", parsedUser.id).order("created_at", { ascending: false });
        if (error) {
          console.error("failed to fetch user posts", error);
          setMyPosts(getPostsByUser(parsedUser.email));
          return;
        }

        const mapped: Post[] = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          type: (p.is_free ? "free" : p.type) as Post['type'],
          category: p.category as Post['category'],
          department: p.dept,
          price: p.price,
          imageUrl: null,
          contactInfo: p.contact,
          userId: parsedUser.email,
          userName: parsedUser.name,
          userDepartment: parsedUser.department || p.dept,
          status: (p.sold_out ? "sold" : p.rejected ? "rejected" : p.approved ? "approved" : "pending") as Post['status'],
          createdAt: p.created_at,
        }));
        setMyPosts(mapped);
      } catch (e) {
        console.error(e);
        setMyPosts(getPostsByUser(parsedUser.email));
      }
    })();
  }, [navigate]);

  const handleMarkSold = (postId: string) => {
    (async () => {
      const { error } = await supabase.from("posts").update({ sold_out: true, updated_at: new Date() }).eq("id", postId);
      if (error) {
        console.error("mark sold failed", error);
        toast.error("Failed to mark sold");
        return;
      }
      setMyPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "sold" } : p)));
      toast.success("Item marked as sold!");
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="glass-card p-8 mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0">
              <User className="w-12 h-12" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">BUET Student</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{user.department}</span>
                  </div>
                )}
                {user.level && user.term && (
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Level {user.level}, Term {user.term}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* My Listings */}
        <div className="animate-slide-up">
          <h2 className="text-xl font-semibold mb-6">My Listings</h2>
          
          {myPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showActions
                  onMarkSold={handleMarkSold}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start sharing or selling your resources to help fellow BUETians
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/sell" className="btn-primary">
                  Sell Something
                </Link>
                <Link to="/share" className="btn-accent">
                  Share for Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
