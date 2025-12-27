import { useNavigate, useParams } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import { getPosts } from "@/store/posts";
import { useEffect, useState } from "react";

const MakePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const posts = getPosts();
    const p = posts.find((x) => x.id === id);
    setPost(p || null);
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

          <button
            onClick={() => navigate(`/mock-payment/${id}`)}
            className="btn-primary w-full"
          >
            Choose Payment Option
          </button>
        </div>
      </main>
    </div>
  );
};

export default MakePayment;
