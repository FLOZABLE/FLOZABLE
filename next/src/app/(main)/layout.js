import MainFooter from "../components/Others/MainFooter/MainFooter";
import MainHeader from "../components/Others/MainHeader/MainHeader";

export default function MainLayout({ children }) {
  return (
    <div>
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}
