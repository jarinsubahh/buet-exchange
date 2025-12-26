import { Share2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl rotate-6 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-cyan-400 rounded-xl flex items-center justify-center">
          <Share2 className={size === "lg" ? "w-8 h-8" : size === "md" ? "w-5 h-5" : "w-4 h-4"} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${textClasses[size]} gradient-text`}>
          ShareSphere
        </span>
      )}
    </div>
  );
};

export default Logo;
