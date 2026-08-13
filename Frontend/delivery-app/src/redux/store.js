import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import dashboardReducer from './features/dashboardSlice';
import deliveriesReducer from './features/deliveriesSlice';
import uiReducer from './features/uiSlice';

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
    dashboard: dashboardReducer,
    deliveries: deliveriesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(reduxLoggerMiddleware),
});

export default store;
