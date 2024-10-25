import "./globals.css";
import { AppProvider } from "@/app/utils/Contexts";
import AddSubjectModal from "@/app/components/Modals/AddSubjectModal/AddSubjectModal";
import JoinGroupModal from "@/app/components/Modals/JoinGroupModal/JoinGroupModal";
import TopNotification from "@/app/components/Modals/TopNotification/TopNotification";
import ChatModal from "@/app/components/Modals/ChatModal/ChatModal";
import AccountModal from "@/app/components/Modals/AccountModal/AccountModal";
import Tutorial from "./components/Others/Tutorial/Tutorial";
import { GoogleAnalytics } from "@next/third-parties/google";
import SubjectsModal from "./components/Modals/SubjectsModal/SubjectsModal";
import SearchUsersModal from "./components/Modals/SearchUsersModal/SearchUsersModal";
import PlanModal from "./components/Modals/PlanModal/PlanModal";
import { Suspense } from "react";
import EditGroupModal from "./components/Modals/EditGroupModal/EditGroupModal";
import "react-loading-skeleton/dist/skeleton.css";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/* import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js"; */

const gaId = process.env.NEXT_PUBLIC_GA_ID;

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <Suspense>
          <AppProvider>
            <PlanModal />
            <ChatModal />
            <AccountModal />
            <TopNotification />
            <JoinGroupModal />
            <AddSubjectModal />
            <SubjectsModal />
            <SearchUsersModal />
            <EditGroupModal />
            <Tutorial />
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </AppProvider>
        </Suspense>
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
