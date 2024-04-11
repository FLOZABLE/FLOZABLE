import Header from "@/app/components/Others/Header/Header";
import Sidebar from "@/app/components/Others/Sidebar/Sidebar";

function Layout({children}) {
  return (
    <>
    {children}
    <Sidebar />
    <Header />
    </>
  )
};

export default Layout;