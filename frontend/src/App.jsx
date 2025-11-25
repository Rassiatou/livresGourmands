import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";   // 🔥 Ajout important
import Footer from "./components/Footer.jsx";

import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* 🔥 La navbar est ici, en haut de toutes les pages */}
      <Navbar />

      <main className="flex-fill py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ouvrages/:id" element={<ProductPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
