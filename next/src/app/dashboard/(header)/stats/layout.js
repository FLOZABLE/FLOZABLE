export const metadata = {
  title: 'Stats - FLOZABLE',
  description:
    'Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/stats',
    title: 'Stats - FLOZABLE',
    description:
      'Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time.',
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
    url: 'https://flozable.com/stats',
    title: 'Stats - FLOZABLE',
    description:
      'Explore detailed statistics on your study habits with FLOZABLE Stats. Track study hours, set goals, and analyze your performance over time.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['study statistics', 'performance analysis', 'study goals'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://flozable.com/favicon.ico',
  },
};

export default function Layout({children}) {
  return children
};