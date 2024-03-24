const { Router } = require("express");
const {
  addWorker,
  getWorker,
  getWorkerID,
  updateWorker,
  deleteWorkerID,
  loginWorker,
  logoutWorker,
  refreshWorkerToken,
  workerActivate,
} = require("../controllers/worker.controller");

const router = Router();

router.post("/", addWorker);
router.get("/", getWorker);
router.post("/login", loginWorker);
router.post("/logout", logoutWorker);
router.post("/refresh", refreshWorkerToken);
router.get("/:id", getWorkerID);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorkerID);
router.get("/activate/:link", workerActivate);
module.exports = router;
