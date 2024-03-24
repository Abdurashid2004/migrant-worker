const { Router } = require("express");
const {
  addCountry,
  getCountry,
  getCountryID,
  updateCountry,
  deleteCountryID,
} = require("../controllers/country.controller");

const adminPolice = require("../middlewares/admin_police");

const router = Router();

router.post("/", addCountry);
router.get("/", getCountry);
router.get("/:id", adminPolice, getCountryID);
router.put("/:id", adminPolice, updateCountry);
router.delete("/:id", adminPolice, deleteCountryID);

module.exports = router;
