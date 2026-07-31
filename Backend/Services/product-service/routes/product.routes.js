import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";
import { requireAuth, requireSeller } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(requireAuth, requireSeller, upload.array("images", 5), createProduct);

router.route("/:id")
  .get(getProductById)
  .put(requireAuth, requireSeller, upload.array("images", 5), updateProduct)
  .delete(requireAuth, requireSeller, deleteProduct);

export default router;
