const pool = require("../config/db");
const { worker_jobValidation } = require("../validations/worker_job");

const addWorker_job = async (req, res) => {
  try {
    const { error, value } = worker_jobValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    console.log(value);

    const { worker_id, job_id } = value;

    const newWorker_job = await pool.query(
      `
    INSERT INTO worker_job(worker_id, job_id)
      VALUES($1, $2,) RETURNING *

    `,
      [worker_id, job_id]
    );
    console.log(newWorker_job);
    res.status(200).send({ newWorker_job });
  } catch (error) {
    console.log(error);
  }
};

const getWorker_job = async (req, res) => {
  try {
    const newWorker_job = await pool.query(
      `
      SELECT * FROM worker_job
      `
    );
    console.log(newWorker_job);
    res.status(200).send({ newWorker_job });
  } catch (error) {
    console.log(error);
  }
};

const getWorker_jobID = async (req, res) => {
  try {
    const { id } = req.params;

    const newWorker_job = await pool.query(
      `
        SELECT * FROM worker_job WHERE id=$1,
      `[id]
    );
    if (newWorker_job.rows.length == 0) {
      console.log("Not found worker_job");
    }
    console.log(newWorker_job);
    res.status(200).send(newWorker_job.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

const updateWorker_job = async (req, res) => {
  const { worker_id, job_id } = req.body;
  const { id } = req.params;
  try {
    const newWorker_job = await pool.query(
      `
      UPDATE worker_job SET  worker_id=$1, job_id=$2  WHERE id=$3 RETURNING *
    `,
      [worker_id, job_id, id]
    );
    if (newWorker_job.rows.length == 0) {
      console.log("Not found worker_job");
    }
    console.log(newWorker_job);
    res.status(200).send(newWorker_job.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteWorker_jobID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteWorker_job = await pool.query(
    `
    DELETE FROM worker_job WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteWorker_job.rows.length == 0) {
    console.log("Not found worker_job");
  }
  console.log(deleteWorker_job);
  res.status(200).send(deleteWorker_job.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

module.exports = {
  addWorker_job,
  getWorker_job,
  getWorker_jobID,
  updateWorker_job,
  deleteWorker_jobID,
};
