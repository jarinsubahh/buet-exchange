import { Post } from "@/types";

// Mock data for demo purposes
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Engineering Mathematics by Erwin Kreyszig",
    description: "10th edition, excellent condition. Used for Level 1 math courses. Minimal highlighting.",
    type: "sell",
    category: "book",
    department: "CSE",
    price: 500,
    imageUrl: "",
    contactInfo: "+880 1712345678",
    userId: "user1",
    userName: "Fahim Rahman",
    userDepartment: "CSE",
    status: "approved",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Digital Logic Design Lab Manual PDF",
    description: "Complete lab manual with all experiments and solutions. Perfect for EEE and CSE students.",
    type: "free",
    category: "pdf",
    department: "EEE",
    contactInfo: "fahim@eee.buet.ac.bd",
    fileUrl: "https://example.com/digital-logic-manual.pdf",
    isPdf: true,
    userId: "user2",
    userName: "Nadia Akter",
    userDepartment: "EEE",
    status: "approved",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Breadboard and Arduino Kit",
    description: "Complete Arduino starter kit with breadboard, jumper wires, LEDs, resistors, and sensors. Great for microcontroller projects.",
    type: "sell",
    category: "lab_equipment",
    department: "EEE",
    price: 1500,
    imageUrl: "",
    contactInfo: "+880 1898765432",
    userId: "user3",
    userName: "Rakib Hassan",
    userDepartment: "EEE",
    status: "approved",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Mechanics of Materials Notes",
    description: "Handwritten notes covering the entire syllabus. Clear diagrams and solved problems included.",
    type: "free",
    category: "notes",
    department: "ME",
    contactInfo: "student@me.buet.ac.bd",
    userId: "user4",
    userName: "Tasnim Islam",
    userDepartment: "ME",
    status: "approved",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "Fluid Mechanics Textbook",
    description: "Frank M. White, 8th edition. Minor wear on cover but pages are clean.",
    type: "sell",
    category: "book",
    department: "CE",
    price: 800,
    imageUrl: "",
    contactInfo: "+880 1555555555",
    userId: "user5",
    userName: "Sadia Khan",
    userDepartment: "CE",
    status: "pending",
    createdAt: "2024-01-11",
  },
];

export const getPosts = (): Post[] => {
  const saved = localStorage.getItem("posts");
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem("posts", JSON.stringify(mockPosts));
  return mockPosts;
};

export const savePosts = (posts: Post[]) => {
  localStorage.setItem("posts", JSON.stringify(posts));
};

export const addPost = (post: Omit<Post, "id" | "createdAt" | "status">) => {
  const posts = getPosts();
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split("T")[0],
    status: "pending",
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
};

export const updatePostStatus = (postId: string, status: Post["status"]) => {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index !== -1) {
    posts[index].status = status;
    savePosts(posts);
  }
};

export const getPostsByUser = (userId: string): Post[] => {
  return getPosts().filter((p) => p.userId === userId);
};

export const getApprovedPosts = (): Post[] => {
  return getPosts().filter((p) => p.status === "approved" || p.status === "sold");
};

export const getPendingPosts = (): Post[] => {
  return getPosts().filter((p) => p.status === "pending");
};
