import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartApi,
  addItemToCartApi,
  updateCartItemQuantityApi,
  removeCartItemApi,
  clearCartApi,
} from "../../services/cartApi.js";

// Helper to format MongoDB cart items for frontend UI compatibility
const formatCartItems = (backendCart) => {
  if (!backendCart || !backendCart.Items) return [];
  return backendCart.Items.map((item) => ({
    product: {
      id: item.ProductId,
      _id: item.ProductId,
      name: item.ProductName,
      price: item.PriceAtAddition,
      image: item.ProductImage,
      sellerId: item.SellerId,
    },
    shop: {
      shopName: "Local Seller",
      price: item.PriceAtAddition,
    },
    quantity: item.Quantity,
    subtotal: item.Subtotal,
    fulfillmentMode: "delivery",
  }));
};

// Async Thunks connecting Redux to Backend cart-service
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCartApi();
      return formatCartItems(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ product, quantity = 1 }, { rejectWithValue }) => {
    try {
      const productId = product.id || product._id;
      const data = await addItemToCartApi(productId, quantity);
      return formatCartItems(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await updateCartItemQuantityApi(productId, quantity);
      return formatCartItems(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await removeCartItemApi(productId);
      return formatCartItems(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, { rejectWithValue }) => {
    try {
      await clearCartApi();
      return [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Synchronous local fallback actions
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // addToCartAsync
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // updateQuantityAsync
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // removeFromCartAsync
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // clearCartAsync
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartStatus = (state) => state.cart.status;

export default cartSlice.reducer;
