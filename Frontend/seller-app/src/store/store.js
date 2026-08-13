import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import orderReducer from '../features/orders/orderSlice';

const reduxLoggerMiddleware = (store) => (next) => (action) => {
  console.log("[Redux Debug] Dispatching action:", action.type);
  console.log("[Redux Debug] Payload:", action.payload);
  const result = next(action);
  console.log("[Redux Debug] Next State:", store.getState());
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(reduxLoggerMiddleware),
});

export default store;
