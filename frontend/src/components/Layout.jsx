import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="flex-1 relative">
        <Outlet />
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
