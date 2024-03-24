const pool = require("../config/db");
const { jobValidation } = require("../validations/job");

const addJob = async (req, res) => {
  try {
    const { error, value } = jobValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const { name, description, icon } = value;

    const newJob = await pool.query(
      `
    INSERT INTO job(name, description, icon)
      VALUES($1, $2, $3) RETURNING * `,
      [name, description, icon]
    );
    console.log(newJob);
    res.status(200).send({ newJob });
  } catch (error) {
    console.log(error);
  }
};

const getJob = async (req, res) => {
  try {
    const newJob = await pool.query(
      `
      SELECT * FROM job
      `
    );
    console.log(newJob);
    res.status(200).send({ newJob });
  } catch (error) {
    console.log(error);
  }
};

const getJobID = async (req, res) => {
  try {
    const { id } = req.params;

    const newJob = await pool.query(
      `
        SELECT * FROM job WHERE id=$1,
      `[id]
    );
    if (newJob.rows.length == 0) {
      console.log("Not found job");
    }
    console.log(newJob);
    res.status(200).send(newJob.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

const updateJob = async (req, res) => {
  const { name, description, icon } = req.body;
  const { id } = req.params;
  try {
    const newJob = await pool.query(
      `
      UPDATE job SET name=$1, description=$2, icon=$3 WHERE id=$4 RETURNING *
    `,
      [name, description, icon, id]
    );
    if (newJob.rows.length == 0) {
      console.log("Not found job");
    }
    console.log(newJob);
    res.status(200).send(newJob.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteJobID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteJob = await pool.query(
    `
    DELETE FROM job WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteJob.rows.length == 0) {
    console.log("Not found job");
  }
  console.log(deleteJob);
  res.status(200).send(deleteJob.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

module.exports = {
  addJob,
  getJob,
  getJobID,
  updateJob,
  deleteJobID,
};
