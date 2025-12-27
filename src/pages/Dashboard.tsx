import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, User, Tag, Gift, LogOut } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import PostCard from "@/components/PostCard";
import DepartmentTabs from "@/components/DepartmentTabs";
import { getApprovedPosts } from "@/store/posts";
import { supabase } from "@/lib/supabase";
import { Post, Department } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    // fetch approved posts from Supabase
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("approved", true)
        .eq("sold_out", false)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch posts", error);
        setPosts(getApprovedPosts());
        return;
      }

      // fetch users for mapping seller info
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
        imageUrl: null,
        contactInfo: p.contact,
        userId: usersMap[p.seller_id]?.email ?? usersMap[p.user_id]?.email ?? p.seller_id ?? p.user_id,
        userName:
          usersMap[p.seller_id]?.name ?? usersMap[p.user_id]?.name ?? p.name ?? "Student User",
        userDepartment: usersMap[p.seller_id]?.dept ?? usersMap[p.user_id]?.dept ?? p.dept,
        status: (p.sold_out ? "sold" : p.rejected ? "rejected" : p.approved ? "approved" : "pending") as Post['status'],
        createdAt: p.created_at,
      }));

      setPosts(mapped);
    })();
  }, [navigate]);

  const filteredPosts = posts.filter((post) => {
    const matchesDept = selectedDept === "ALL" || post.department === selectedDept;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="sm" />

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="input-field w-full pl-12"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/sell" className="btn-primary hidden sm:flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4" />
              Sell
            </Link>
            <Link to="/share" className="btn-accent hidden sm:flex items-center gap-2 text-sm">
              <Gift className="w-4 h-4" />
              Share Free
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <User className="w-5 h-5" />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-12 w-56 glass-card p-2 z-50 animate-scale-in">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="input-field w-full pl-12"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Department Tabs */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Filter by Department</h2>
          <DepartmentTabs selected={selectedDept} onSelect={setSelectedDept} />
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden gap-3 mb-6">
          <Link to="/sell" className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <Tag className="w-4 h-4" />
            Sell
          </Link>
          <Link to="/share" className="btn-accent flex-1 flex items-center justify-center gap-2 text-sm">
            <Gift className="w-4 h-4" />
            Share Free
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FAB for mobile */}
      <button
        onClick={() => navigate("/sell")}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan-400 shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;
