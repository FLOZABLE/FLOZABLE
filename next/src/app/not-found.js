import Link from "next/link";
import Header from "./components/Others/Header/Header";
import Sidebar from "./components/Others/Sidebar/Sidebar";
import styles from "./NotFound.module.css";

export const metadata = {
  title: 'Dashboard - FLOZABLE',
  description:
    'Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.',
  openGraph: {
    type: 'website',
    url: 'https://flozable.com/dashboard',
    title: 'Dashboard - FLOZABLE',
    description:
      'Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.',
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
    url: 'https://flozable.com/dashboard',
    title: 'Dashboard - FLOZABLE',
    description:
      'Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.',
    images: ['https://flozable.com/favicon.ico'],
  },
  keywords: ['progress tracking', 'study achievements', 'study sessions planning'],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://flozable.com/favicon.ico',
  },
};

export default function NotFound() {
  return (
    <div className={styles.NotFound}>
      <Header />
      <Sidebar />
      <div className={styles.fixedBox}>
        <p className={styles.text}>Page not found</p>
        <Link href={"/dashboard"}>
          <p className={styles.link}>return to dashbaord</p>
        </Link>
      </div>
    </div>
  )
}