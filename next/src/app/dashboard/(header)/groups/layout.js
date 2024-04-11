export const metadata = {
  title: 'Groups - FLOZABLE',
  description:
    'Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/groups',
    title: 'Groups - FLOZABLE',
    description:
      'Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together.',
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
    url: 'https://flozable.com/groups',
    title: 'Groups - FLOZABLE',
    description:
      'Join or create study groups on FLOZABLE. Collaborate with users who share similar interests, participate in group activities, and enhance your learning journey together.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['study groups', 'collaboration', 'group activities', 'shared interests'],
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