const { Router } = require("express");
const {
  addAdmin,
  getAdmin,
  getAdminID,
  updateAdmin,
  deleteAdminID,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
} = require("../controllers/admin.controller");

const adminPolice = require("../middlewares/admin_police");
const creatorPolice = require("../middlewares/ceator_police");

const router = Router();

router.post("/", creatorPolice, addAdmin);
router.get("/", adminPolice, getAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.post("/refresh", refreshAdminToken);
router.get("/:id", creatorPolice, getAdminID);
router.put("/:id", creatorPolice, updateAdmin);
router.delete("/:id", creatorPolice, deleteAdminID);

module.exports = router;
