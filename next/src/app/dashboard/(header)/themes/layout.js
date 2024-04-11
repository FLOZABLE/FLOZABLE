export const metadata = {
  title: 'Themes - FLOZABLE',
  description:
    'Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/themes',
    title: 'Themes - FLOZABLE',
    description:
      'Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience.',
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
    url: 'https://flozable.com/themes',
    title: 'Themes - FLOZABLE',
    description:
      'Explore different themes on FLOZABLE. Enhance your study environment by choosing themes that match your preferences. Stay focused and motivated with a personalized study experience.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['themes', 'study environment', 'focus', 'motivation', 'personalized study'],
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