export const metadata = {
  title: 'User Profile - FLOZABLE',
  description:
    'Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/user',
    title: 'User Profile - FLOZABLE',
    description:
      'Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey.',
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
    url: 'https://flozable.com/user',
    title: 'User Profile - FLOZABLE',
    description:
      'Explore the user profile on FLOZABLE. View achievements, study habits, and connect with other users. Join the community and stay motivated on your academic journey.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['user profile', 'achievements', 'study habits', 'community', 'academic journey'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://flozable.com/favicon.ico',
  },
};

export default function Layout({children}) {
  return children;
};