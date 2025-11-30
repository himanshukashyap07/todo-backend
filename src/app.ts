import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
configDotenv();

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH, OPTIONS");
  next();
});
app.get("/",(req,res)=>{
  res.send("running good")
})

// Parse JSON bodies (for API clients sending JSON)
app.use(express.json({ limit: "16kb" }));
// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(errorHandler)
//import routes
import userRouter from "./routes/user.route.js";
import todoRouter from "./routes/todo.route.js";
import { errorHandler } from "./middlewares/errorHandler.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/todo", todoRouter);


export default app