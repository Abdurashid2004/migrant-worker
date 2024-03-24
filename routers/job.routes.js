const { Router } = require("express");
const {
  addJob,
  getJob,
  getJobID,
  updateJob,
  deleteJobID,
} = require("../controllers/job.controller");

const router = Router();

router.post("/", addJob);
router.get("/", getJob);
router.get("/:id", getJobID);
router.put("/:id", updateJob);
router.delete("/:id", deleteJobID);

module.exports = router;
