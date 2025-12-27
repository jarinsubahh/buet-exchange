import { useNavigate, useParams } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { getPosts } from "@/store/posts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MakePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const posts = getPosts();
      const p = posts.find((x) => x.id === id);
      if (p) {
        setPost(p || null);
        return;
      }

      try {
        const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
        if (error) {
          console.error("Failed to fetch post for payment", error);
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
            <h2 className="text-lg font-semibold mb-2">Item not found</h2>
            <p className="text-muted-foreground mb-6">The item could not be loaded for payment.</p>
            <button onClick={() => navigate('/dashboard')} className="py-2 px-4 rounded bg-secondary/10">Back to Dashboard</button>
          </div>
        </main>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold mb-2">Make Payment</h2>
          <p className="text-muted-foreground mb-6">Choose a payment option to access the seller's resource.</p>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground">Item</div>
            <div className="font-medium">{post.title}</div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-2xl font-bold">৳{post.price ?? 0}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/access/${id}?paid=1`)}
              className="btn-primary w-full"
            >
              Proceed to Payment
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 rounded-lg bg-secondary/10 text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MakePayment;
