export const metadata = {
  title: 'Account - FLOZABLE',
  description:
    'Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/account',
    title: 'Account - FLOZABLE',
    description:
      'Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience.',
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
    url: 'https://flozable.com/account',
    title: 'Account - FLOZABLE',
    description:
      'Manage your FLOZABLE account settings. Explore options for personalization, security, and other account-related features to enhance your experience.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['account settings', 'user profile', 'customization'],
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