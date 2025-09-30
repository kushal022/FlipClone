import express from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../controllers/address/addAddress.js";

const router = express.Router();

router.post("/", requireSignIn, addAddress);
router.get("/", requireSignIn, getAddresses);
router.put("/:id", requireSignIn, updateAddress);
router.delete("/:id", requireSignIn, deleteAddress);

export default router;
