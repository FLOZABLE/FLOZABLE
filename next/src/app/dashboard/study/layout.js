export const metadata = {
  title: 'Study - FLOZABLE',
  description:
    'Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/study',
    title: 'Study - FLOZABLE',
    description:
      'Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session.',
    images: [
      {
        url: 'https://flozable.com/favicon.ico',
        width: 800,
        height: 600,
        alt: 'FLOZABLE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://flozable.com/study',
    title: 'Study - FLOZABLE',
    description:
      'Enhance your learning experience on FLOZABLE. Access study materials, set personalized study plans, and engage with a community of learners for a more productive study session.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['learning experience', 'study materials', 'personalized plans', 'community engagement'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://flozable.com/favicon.ico',
  },
}

export default function Layout({ children }) {
  return children;
}