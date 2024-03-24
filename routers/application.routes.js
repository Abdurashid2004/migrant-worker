const { Router } = require("express");
const {
  addApplication,
  getApplication,
  getApplicationID,
  updateApplication,
  deleteApplicationID,
} = require("../controllers/application.controller");

const router = Router();

router.post("/", addApplication);
router.get("/", getApplication);
router.get("/:id", getApplicationID);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplicationID);
module.exports = router;
