const { Router } = require("express");
const {
  addVacansy,
  getVacansy,
  getVacansyID,
  updateVacansy,
  deleteVacansyID,
} = require("../controllers/vacansy.controller");

const router = Router();

router.post("/", addVacansy);
router.get("/", getVacansy);
router.get("/:id", getVacansyID);
router.put("/:id", updateVacansy);
router.delete("/:id", deleteVacansyID);

module.exports = router;
