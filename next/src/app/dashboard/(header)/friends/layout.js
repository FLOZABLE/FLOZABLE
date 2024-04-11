export const metadata = {
  title: 'Friends - FLOZABLE',
  description:
    'Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/friends',
    title: 'Friends - FLOZABLE',
    description:
      'Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers.',
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
    url: 'https://flozable.com/friends',
    title: 'Friends - FLOZABLE',
    description:
      'Connect with friends on FLOZABLE. Build a network of study buddies, share achievements, and enjoy a collaborative learning atmosphere with your peers.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['connect with friends', 'study buddies', 'collaborative learning'],
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