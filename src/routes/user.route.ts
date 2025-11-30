import { Router } from "express";
import { getAllTodos, getCurrentUser, loginUser, logOutUser, registerUser, updateUserPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();


router.route("/register")
    .post(registerUser);    

router.route("/current-user")
    .get(verifyJWT,getCurrentUser);

router.route("/login").post(loginUser);
router.route("/todos").get(verifyJWT,getAllTodos);
router.route("/logout").post(verifyJWT,logOutUser);
router.route("/update-password").patch(verifyJWT,updateUserPassword);


export default router;