import { Post } from "@/types";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Wrench, StickyNote, Package, Phone, User, Building2 } from "lucide-react";

interface PostCardProps {
  post: Post;
  onMarkSold?: (postId: string) => void;
  showActions?: boolean;
  showAccess?: boolean;
}

const categoryIcons = {
  pdf: FileText,
  book: BookOpen,
  lab_equipment: Wrench,
  notes: StickyNote,
  other: Package,
};

const categoryLabels = {
  pdf: "PDF",
  book: "Book",
  lab_equipment: "Lab Equipment",
  notes: "Notes",
  other: "Other",
};

const PostCard = ({ post, onMarkSold, showActions = false, showAccess = true }: PostCardProps) => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const CategoryIcon = categoryIcons[post.category];

  return (
    <div className="glass-card p-6 card-hover relative overflow-hidden group">
      {/* Status Badge */}
      {post.status === "sold" && (
        <div className="absolute top-4 right-4 badge-sold px-3 py-1 rounded-full text-xs font-medium">
          Sold Out
        </div>
      )}
      {post.status === "rejected" && (
        <div className="absolute top-4 right-4 badge-rejected px-3 py-1 rounded-full text-xs font-medium">
          Rejected
        </div>
      )}
      {post.type === "free" && post.status !== "sold" && (
        <div className="absolute top-4 right-4 badge-free px-3 py-1 rounded-full text-xs font-medium">
          Free
        </div>
      )}
      {post.status === "pending" && (
        <div className="absolute top-4 right-4 badge-pending px-3 py-1 rounded-full text-xs font-medium">
          Pending
        </div>
      )}

      {/* Category Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4">
        <CategoryIcon className="w-6 h-6 text-primary" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 pr-20 line-clamp-2">{post.title}</h3>

      {/* Category & Department Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
          {categoryLabels[post.category]}
        </span>
        <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
          {post.department}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.description}</p>

      {/* Price */}
      {post.type === "sell" && post.status !== "sold" && (
        <div className="text-xl font-bold gradient-text mb-4">
          ৳{post.price}
        </div>
      )}

      {/* Seller Info */}
      <div className="border-t border-border pt-4 mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{post.userName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{post.userDepartment}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{post.contactInfo}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4">
        {showAccess && (
          <Link
            to={post.type === "sell" && post.status !== "sold" && !currentUser?.isAdmin ? `/make-payment/${post.id}` : `/access/${post.id}`}
            className="block w-full text-center py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            Access
          </Link>
        )}

        {showActions && post.status === "approved" && (
          <button
            onClick={() => onMarkSold?.(post.id)}
            className="mt-3 w-full py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-sm font-medium"
          >
            Mark as Sold
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
