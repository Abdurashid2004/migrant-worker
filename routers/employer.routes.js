const { Router } = require("express");
const {
  addEmployer,
  getEmployer,
  getEmployerID,
  updateEmployer,
  deleteEmployerID,
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
} = require("../controllers/employer.controller");

const router = Router();

router.post("/", addEmployer);
router.get("/", getEmployer);
router.get("/:id", getEmployerID);
router.post("/login", loginEmployer);
router.post("/logout", logoutEmployer);
router.post("/refresh", refreshEmployerToken);
router.put("/:id", updateEmployer);
router.delete("/:id", deleteEmployerID);

module.exports = router;
