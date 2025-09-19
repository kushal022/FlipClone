import express from "express";
import { registerController } from "../controllers/auth/registerController.js";
import { loginController } from "../controllers/auth/loginController.js";
import { userCheckController } from "../controllers/auth/userExist.js";
import { forgotPasswordController } from "../controllers/auth/forgotPasswordController.js";
import { createError } from "../middleware/errorHandler.js";
import { updateDetailsController } from "../controllers/auth/updateDetailsController.js";
import { deactivateController } from "../controllers/auth/deactivateAccount.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";

//router object
const router = express.Router();

//* routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//USER EXIST || METHOD POST
router.post("/user-exist", userCheckController);

// FORGOT PASSWORD ROUTE
router.post("/forgot-password", forgotPasswordController);

// update details POST route\
router.post("/update-details", updateDetailsController);

// deactivate account
router.post("/deactivate", deactivateController);

//protected route-user
router.get("/user-auth", requireSignIn, (req, res, next) => {
    try {
        res.status(200).send({
            ok: true,
        });
    } catch (error) {
        next(createError(500, error, "Error in Costumer authentication for protected routes"))
    }
});

//protected Admin route
router.get("/admin-auth", isAdmin, (req, res, next) => {
    try {
        res.status(200).send({
            ok: true,
        });
    } catch (error) {
        next(createError(500, error, "Error in Admin authentication for protected routes"))
    }
});



export default router;
