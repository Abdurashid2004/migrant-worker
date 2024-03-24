const { Router } = require("express");

const adminRouter = require("./admin.routes");
const applcationRouter = require("./application.routes");
const countryRouter = require("./country.routes");
const employerRouter = require("./employer.routes");
const jobRouter = require("./job.routes");
const vacansyRouer = require("./vacansy.routes");
const workerRouter = require("./worker.routes");
const worker_jobRouter = require("./worker_job.routes");

const router = Router();

router.use("/admin", adminRouter);
router.use("/application", applcationRouter);
router.use("/country", countryRouter);
router.use("/employer", employerRouter);
router.use("/job", jobRouter);
router.use("/vacansy", vacansyRouer);
router.use("/worker", workerRouter);
router.use("/worker_job", worker_jobRouter);

module.exports = router;
