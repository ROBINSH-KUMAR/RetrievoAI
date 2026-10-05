import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js";
import {ingestDocument} from "../controller/user.controller.js"
const router = Router();



router.route("/upload").post(upload.single("pdf"), ingestDocument)













export default router;