import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js";
const router = Router();

router.route("/user").get((req, res) => {
    res.send("User route");
});

export default router;