import { Router } from "express";
import authRoutes from "./authRoutes.js";
import mapRoutes from "./mapRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/maps", mapRoutes);


router.get("/error-test", (_req, _res) => {
    throw new Error("Test error from route");
  });
  

export default router;
