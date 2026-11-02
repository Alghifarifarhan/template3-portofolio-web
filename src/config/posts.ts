// This file is auto-generated. Do not edit manually.
import { Post } from '@/types/post';

export interface PostsConfig {
  title: string;
  description: string;
  backButton: string;
  noPosts: string;
  searchPlaceholder: string;
  pagination: {
    previous: string;
    next: string;
  };
  posts: Post[];
}

export const postsConfig: PostsConfig = {
  title: "Posts",
  description: "",
  backButton: "Back to Home",
  noPosts: "No posts found matching your search.",
  searchPlaceholder: "Search posts by title...",
  pagination: {
    previous: "Previous",
    next: "Next"
  },
  posts: []
};
