"use client";

import { useEffect } from "react";
import MainFooter from "../components/Others/MainFooter/MainFooter";
import MainHeader from "../components/Others/MainHeader/MainHeader";

export default function MainLayout({ children }) {
  useEffect(() => {
    // Set font size for the Onboarding page
    document.documentElement.style.fontSize = "15px";

    // Cleanup: Reset font size when leaving the page
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  return (
    <div>
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}
