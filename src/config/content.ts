export const siteConfig = {
  name: "Portfolio",
  description: "Personal Portfolio Website",
  nav: {
    home: "Home",
    posts: "Posts",
    projects: "Projects",
    about: "About"
  },
  home: {
    greeting: "",
    description: "",
    buttons: {
      viewProjects: "View Projects",
      readPosts: "Read Posts"
    }
  },
  projects: {
    title: "Projects",
    description: "",
    backButton: "Back to Home",
    noProjects: "No projects found.",
    items: []
  },
  posts: {
    title: "Posts",
    description: "",
    backButton: "Back to Home",
    noPosts: "No posts found matching your search.",
    searchPlaceholder: "Search posts by title...",
    pagination: {
      previous: "Previous",
      next: "Next"
    },
    items: []
  },
  about: {
    title: "About",
    description: "",
    backButton: "Back to Home"
  },
  theme: {
    dayMode: "Day mode",
    nightMode: "Night mode"
  }
} as const;