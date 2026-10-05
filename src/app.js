import express from "express";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
const app = express();
app.use(cors(
  {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  } 
))






app.get('/', (req, res) => {
  res.send("Hello world");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));  


//router
app.use("/api/v1/users", userRouter);





export default app;