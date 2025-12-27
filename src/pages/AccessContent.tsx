import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { getPosts, updatePostStatus } from "@/store/posts";
import { supabase } from "@/lib/supabase";

const AccessContent = () => {
  const { id } = useParams();
  const [search] = useSearchParams();
  const paid = search.get("paid") === "1";
  const [post, setPost] = useState<any>(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    (async () => {
      const posts = getPosts();
      const pLocal = posts.find((x) => x.id === id);
      if (pLocal) {
        setPost(pLocal);
        return;
      }

      // fetch from Supabase if not found locally
      try {
        const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
        if (error) {
          console.error("Failed to fetch post from supabase", error);
          setPost(null);
          return;
        }
        if (!data) {
          setPost(null);
          return;
        }

        const mapped = {
          id: data.id,
          title: data.title,
          description: data.description,
          type: data.is_free ? "free" : data.type,
          category: data.category,
          department: data.dept,
          price: data.price,
          imageUrl: data.image_url ?? null,
          fileUrl: data.file_url ?? null,
          isPdf: data.is_pdf ?? false,
          contactInfo: data.contact,
          userId: data.seller_id ?? data.user_id,
          userName: data.name ?? data.seller_id ?? data.user_id,
          userDepartment: data.dept,
          status: data.sold_out ? "sold" : data.rejected ? "rejected" : data.approved ? "approved" : "pending",
          createdAt: data.created_at,
        };

        setPost(mapped as any);
      } catch (ex) {
        console.error(ex);
        setPost(null);
      }
    })();
  }, [id]);

  if (!post) return null;

  const isAdmin = currentUser?.isAdmin;

  // If resource is not approved and viewer is not admin, block access
  if (post.status !== "approved" && !isAdmin) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground">Back</button>
            <Logo size="sm" showText={false} />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="glass-card p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Content Not Available</h2>
            <p className="text-muted-foreground mb-6">This resource is not yet approved by an admin.</p>
            <button onClick={() => navigate('/dashboard')} className="py-2 px-4 rounded bg-secondary/10">Back to Dashboard</button>
          </div>
        </main>
      </div>
    );
  }

  // No admin approve/reject here — admin handles it from admin panel

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">Back</button>
          <Logo size="sm" showText={false} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-2">Access Content</h2>
          <p className="text-muted-foreground mb-6">Open the resource provided by the seller.</p>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground">Title</div>
            <div className="font-medium">{post.title}</div>
          </div>

          {post.fileUrl ? (
            post.isPdf ? (
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">PDF</div>
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline break-all">{post.fileUrl}</a>
                <div className="mt-4">
                  <iframe src={post.fileUrl} className="w-full h-[600px] border" title="pdf-viewer" />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">Image</div>
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline break-all">{post.fileUrl}</a>
                <div className="mt-4">
                  <img src={post.fileUrl} alt={post.title} className="w-full max-h-[480px] object-contain border" />
                </div>
              </div>
            )
          ) : (
            <div className="mb-6 text-muted-foreground">No resource URL provided by the seller.</div>
          )}

          <div className="mt-6">
            <button onClick={() => navigate('/dashboard')} className="w-full py-2 rounded-lg bg-secondary/10">Back to Dashboard</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessContent;
