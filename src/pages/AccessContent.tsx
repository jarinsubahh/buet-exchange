import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { getPosts, updatePostStatus } from "@/store/posts";
import { supabase } from "@/lib/supabase";

const AccessContent = () => {
  const { id } = useParams();
  const [search] = useSearchParams();
  const paid = search.get("paid") === "1";
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    (async () => {
      const posts = getPosts();
      const pLocal = posts.find((x) => x.id === id);
      if (pLocal) {
        setPost(pLocal);
        setLoading(false);
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
        setLoading(false);
      } catch (ex) {
        console.error(ex);
        setPost(null);
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
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
            <div className="h-8 w-8 rounded-full border-4 border-primary animate-spin mx-auto mb-4" />
            <div className="text-muted-foreground">Loading resource...</div>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin = currentUser?.isAdmin;

  // If post couldn't be loaded, show friendly message
  if (!post) {
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
            <h2 className="text-lg font-semibold mb-2">Resource Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested resource could not be loaded.</p>
            <button onClick={() => navigate('/dashboard')} className="py-2 px-4 rounded bg-secondary/10">Back to Dashboard</button>
          </div>
        </main>
      </div>
    );
  }

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

  // If it's a sell post and user is not admin and not paid, redirect to make-payment
  if (post.type === "sell" && !paid && !isAdmin) {
    navigate(`/make-payment/${id}`);
    return null;
  }

  // Admin approve/reject handlers (update Supabase and local store)
  const handleApprove = async () => {
    try {
      const { error } = await supabase.from("posts").update({ approved: true, rejected: false, updated_at: new Date() }).eq("id", post.id);
      if (error) {
        console.error("approve failed", error);
        toast.error("Failed to approve post");
        return;
      }
      updatePostStatus(post.id, "approved");
      setPost({ ...post, status: "approved" });
      toast.success("Post approved and published!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ approved: false, rejected: true, updated_at: new Date() })
        .eq("id", post.id);

      if (error) {
        console.error("reject failed", error);
        const msg = (error as any)?.message || String(error);
        if (msg.toLowerCase().includes("column \"rejected\"") || msg.toLowerCase().includes("unrecognized column")) {
          const help = `Your database does not have a boolean column named 'rejected' on the posts table. Run this SQL in Supabase SQL editor to add it:\n\nALTER TABLE public.posts ADD COLUMN rejected boolean DEFAULT false;\n\nThen retry rejecting the post from the admin UI.`;
          console.error(help);
          toast.error("Failed to reject post: DB missing 'rejected' column. See console for SQL to add it.");
          return;
        }
        toast.error("Failed to reject post");
        return;
      }

      updatePostStatus(post.id, "rejected");
      setPost({ ...post, status: "rejected" });
      toast.success("Post rejected (kept in seller profile)");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject post");
    }
  };

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

          <div className="mt-6 flex gap-3">
            {currentUser?.isAdmin && (
              <>
                <button onClick={handleApprove} className="flex-1 py-2 rounded-lg bg-success/20 text-green-500">Approve</button>
                <button onClick={handleReject} className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive">Reject</button>
              </>
            )}

            <button onClick={() => navigate('/dashboard')} className="flex-1 py-2 rounded-lg bg-secondary/10">Back to Dashboard</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessContent;
