export const metadata = {
  title: "Leaderboard - FLOZABLE",
  description:
    "Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals.",
  openGraph: {
    type: "website",
    url: "https://flozable.com/leaderboard",
    title: "Ranking - FLOZABLE",
    description:
      "Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals.",
    images: [
      {
        url: "https://flozable.com/favicon.ico",
        width: 800,
        height: 600,
        alt: "FLOZABLE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    url: "https://flozable.com/ranking",
    title: "Leaderboard - FLOZABLE",
    description:
      "Check your ranking and compete with others on FLOZABLE. Stay motivated and climb the leaderboard by achieving your study goals.",
    images: ["https://flozable.com/favicon.ico"],
  },
  keywords: ["study ranking", "leaderboard", "competition", "study goals"],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "https://flozable.com/favicon.ico",
  },
};

export default function Layout({ children }) {
  return children;
}
