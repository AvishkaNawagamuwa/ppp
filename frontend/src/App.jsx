import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLSA from "./pages/AdminLSA/AdminLSA";
import AdminSPA from "./pages/AdminSPA/AdminSPA";
import { SpaContextProvider } from "./pages/AdminSPA/SpaContext";
import BlogDisplay from './components/BlogDisplay';
import Media from './pages/Blog';
import Gallery from "./pages/Gallery";
import Registration from "./pages/Registration";
import Contact from "./pages/Contact";
import TestNotifications from "./pages/TestNotifications";

function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  // Pages where we want to hide Navbar + Footer
  const hideLayoutRoutes = ["/login", "/adminLSA", "/adminSPA", "/test-notifications"];

  // Check if current path matches any in hideLayoutRoutes
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/blogs" element={<BlogDisplay />} />
        <Route path="/blogs/:id" element={<Media />} />
        <Route path="/adminLSA" element={<AdminLSA />} />
        <Route path="/adminSPA" element={
          <SpaContextProvider>
            <AdminSPA />
          </SpaContextProvider>
        } />
        <Route path="/test-notifications" element={<TestNotifications />} />
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
