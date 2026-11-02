export const globalConfig = {
  site: {
    name: "Portfolio",
    author: "",
    description: "Personal Portfolio Website",
    url: "/"
  },
  navigation: {
    aria: "Main Navigation",
    items: [
      {
        title: "Home",
        href: "/"
      },
      {
        title: "About",
        href: "/about"
      },
      {
        title: "Projects",
        href: "/projects"
      },
      {
        title: "Posts",
        href: "/posts"
      }
    ]
  },
  footer: {
    aria: "Footer Navigation",
    copyright: "",
    social: {
      twitter: "",
      github: "",
      email: ""
    }
  }
} as const;