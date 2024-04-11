export const metadata = {
  title: 'Planner - FLOZABLE',
  description:
    'Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/planner',
    title: 'Planner - FLOZABLE',
    description:
      'Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones.',
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
    url: 'https://flozable.com/planner',
    title: 'Planner - FLOZABLE',
    description:
      'Organize your study schedule and set goals with the FLOZABLE Planner. Stay on track, manage your time effectively, and achieve your academic milestones.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['study planner', 'goal setting', 'time management', 'academic milestones'],
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