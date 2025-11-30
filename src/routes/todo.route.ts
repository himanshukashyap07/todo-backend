import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTodo, DeleteTodo, toggelIsTodoCompelete, updateTodo } from "../controllers/todo.controller.js";


const router = Router();

router.use(verifyJWT);

router.route("/createTodo")
    .post(createTodo)
router.route("/updateTodo/:todoId")
    .patch(updateTodo);
router.route("/deleteTodo/:todoId")
    .delete(DeleteTodo)
router.route("/toggleTodoComplete/:todoId")
    .patch(toggelIsTodoCompelete);

export default router;