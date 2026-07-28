import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "./theme";

import HomePage from "./HomePage/Homepage";
import LoginPage from "./AuthPages/LoginPage";
import SignupPage from "./AuthPages/SignupPage";
import VerificationPage from "./AuthPages/VerificationPage";
import CartPage from "./cart/CartPage";
import ProfilePage from "./profile/ProfilePage";
import ProductDetailPage from "./product/ProductDetailPage";
import MyOrdersPage from "./orders/MyOrdersPage";
import AuthInitializer from "./AuthPages/AuthInitializer";
import "./App.css";

function App() {
  const [themeMode, setThemeMode] = useState("light");

  // Shared Cart State across application
  const [cart, setCart] = useState([
    {
      product: { id: "v1", name: "Onions 1kg", brand: "Fresh Farm", category: "Vegetables" },
      shop: { shopName: "Shree Grocery Mart", price: 32, distanceKm: 0.6 },
      quantity: 2,
      fulfillmentMode: "delivery",
    },
  ]);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleAddToCart = (product, fulfillmentMode = "delivery", shop) => {
    setCart((prevCart) => {
      const selectedShop = shop || product.shops?.[0] || { shopName: "Local Shop", price: product.price || 30 };
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.shop.shopName === selectedShop.shopName
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prevCart,
        {
          product,
          shop: selectedShop,
          quantity: 1,
          fulfillmentMode,
        },
      ];
    });
  };

  const handleUpdateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const newQty = newCart[index].quantity + delta;
      if (newQty <= 0) {
        newCart.splice(index, 1);
      } else {
        newCart[index].quantity = newQty;
      }
      return newCart;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthInitializer />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              themeMode={themeMode}
              onToggleTheme={toggleTheme}
              cart={cart}
              onAddToCart={handleAddToCart}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              themeMode={themeMode}
            />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupPage
              themeMode={themeMode}
            />
          }
        />

        {/* Verification Page */}
        <Route
          path="/verify-email"
          element={
            <VerificationPage
              themeMode={themeMode}
            />
          }
        />

        {/* Dedicated Cart Page */}
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              themeMode={themeMode}
            />
          }
        />

        {/* Dedicated Profile Page */}
        <Route
          path="/profile"
          element={
            <ProfilePage
              themeMode={themeMode}
            />
          }
        />

        {/* Product Details Page */}
        <Route
          path="/product/:id"
          element={
            <ProductDetailPage
              onAddToCart={handleAddToCart}
              themeMode={themeMode}
            />
          }
        />

        {/* My Orders Page */}
        <Route
          path="/orders"
          element={
            <MyOrdersPage
              themeMode={themeMode}
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;