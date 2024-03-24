const { Router } = require("express");
const {
  addWorker_job,
  getWorker_job,
  getWorker_jobID,
  updateWorker_job,
  deleteWorker_jobID,
} = require("../controllers/worker_job.controller");

const router = Router();

router.post("/", addWorker_job);
router.get("/", getWorker_job);
router.get("/:id", getWorker_jobID);
router.put("/:id", updateWorker_job);
router.delete("/:id", deleteWorker_jobID);

module.exports = router;
