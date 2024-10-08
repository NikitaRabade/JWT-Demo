import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 *  Demo route
router.route("/register").get((req, res) => {
    res.send("This is the registration page.");
});
 */

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
);
//https://localhost:3000/users/register => makes particular route

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT , logoutUser);

router.route("/refresh-Token").post(refreshAcessToken);


export default router;
