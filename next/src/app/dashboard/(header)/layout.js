import Header from "@/app/components/Others/Header/Header";
import Sidebar from "@/app/components/Others/Sidebar/Sidebar";

export const metadata = {
  title: "Dashboard - FLOZABLE",
  description:
    "Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.",
  openGraph: {
    type: "website",
    url: "https://flozable.com/dashboard",
    title: "Dashboard - FLOZABLE",
    description:
      "Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.",
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
    url: "https://flozable.com/dashboard",
    title: "Dashboard - FLOZABLE",
    description:
      "Stay organized and track your progress with the FLOZABLE Dashboard. Monitor study hours, view achievements, and plan your study sessions efficiently.",
    images: ["https://flozable.com/favicon.ico"],
  },
  keywords: [
    "progress tracking",
    "study achievements",
    "study sessions planning",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "https://flozable.com/favicon.ico",
  },
};

function Layout({children}) {
  return (
    <>
    {children}
    <Sidebar />
    {/* <Header /> */}
    </>
  )
};

export default Layout;