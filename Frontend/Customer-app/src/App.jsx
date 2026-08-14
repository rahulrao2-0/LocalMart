import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  addToCartAsync,
  updateQuantityAsync,
  removeFromCartAsync,
  clearCartAsync,
  selectCartItems,
} from "./features/cart/cartSlice";

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
import SellerSignupPage from "./AuthPages/SellerSignupPage";
import Navbar from "./HomePage/Navbar";
import "./App.css";

function App() {
  const [themeMode, setThemeMode] = useState("light");
  const dispatch = useDispatch();

  // Redux Toolkit Cart State (Synced with Backend cart-service)
  const cart = useSelector(selectCartItems);

  // Fetch cart from backend cart-service on initial app mount / refresh
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Explicitly ask for location permissions on app startup
  useEffect(() => {
    if ("geolocation" in navigator) {
      // Just requesting the position will trigger the browser permission prompt
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Customer location granted:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Customer location permission denied or failed:", error.message);
        }
      );
    }
  }, []);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleAddToCart = (product, fulfillmentMode = "delivery", shop) => {
    dispatch(addToCartAsync({ product, quantity: 1 }));
  };

  const handleUpdateQuantity = (index, delta) => {
    const item = cart[index];
    if (item) {
      const productId = item.product?.id || item.product?._id;
      const newQty = item.quantity + delta;
      dispatch(updateQuantityAsync({ productId, quantity: newQty }));
    }
  };

  const handleRemoveFromCart = (index) => {
    const item = cart[index];
    if (item) {
      const productId = item.product?.id || item.product?._id;
      dispatch(removeFromCartAsync(productId));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCartAsync());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthInitializer />
      <Navbar 
        cartCount={cart.length} 
        themeMode={themeMode} 
        onToggleTheme={toggleTheme} 
      />

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

        <Route
          path="/seller-signup"
          element={
            <SellerSignupPage
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