export const site = {
  name: "Teddy Malhan",
  title: "Teddy Malhan - Software Engineer",
  description:
    "Software Engineer with experience at EA and Dialpad. Computer Science student at Simon Fraser University.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://malhan.ca",
  portrait: "/ted-aboutme.jpg",
  email: "teddymalhan@gmail.com",
  links: {
    github: "https://github.com/teddymalhan",
    linkedin: "https://www.linkedin.com/in/teddymalhan/",
    booking: "https://cal.com/teddymalhan",
  },
} as const;
