const pool = require("../config/db");
const { applicationValidation } = require("../validations/application");

const addApplication = async (req, res) => {
  try {
    const { error, value } = applicationValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    console.log(value);

    const { vacansy_id, worker_id, application_date } = value;

    const vac_id = await pool.query(`SELECT * FROM  vacansy WHERE id=$1`, [
      vacansy_id,
    ]);

    const work_id = await pool.query(`SELECT * FORM worker WHERE id=$1`, [
      worker_id,
    ]);

    if (vac_id.rows.length == 0 || work_id.rows.length == 0) {
      return res
        .status(400)
        .send({ message: "bunday IDli vacansiya yoki worker yo'q" });
    }

    const newApplication = await pool.query(
      `
    INSERT INTO application(vacansy_id, worker_id, application_date)
        VALUES($1, $2, $3) RETURNING *
    `,
      [vacansy_id, worker_id, application_date]
    );

    console.log(newApplication);
    res.status(200).send({ newApplication });
  } catch (error) {
    console.log(error);
  }
};

const getApplication = async (req, res) => {
  try {
    const newApplication = await pool.query(
      `
      SELECT * FROM application
      `
    );
    console.log(newApplication);
    res.status(200).send({ newApplication });
  } catch (error) {
    console.log(error);
  }
};

const getApplicationID = async (req, res) => {
  try {
    const { id } = req.params;

    const newApplication = await pool.query(
      `
        SELECT * FROM application WHERE id=$1,
      `[id]
    );
    if (newApplication.rows.length == 0) {
      console.log("Not found application");
    }
    console.log(newApplication);
    res.status(200).send(newApplication.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

const updateApplication = async (req, res) => {
  const { vacansy_id, worker_id, application_date } = req.body;
  const { id } = req.params;
  try {
    const newApplication = await pool.query(
      `
      UPDATE application SET vacansy_id=$1, worker_id=$2, application_date=$3  WHERE id=$4 RETURNING *
    `,
      [vacansy_id, worker_id, application_date, id]
    );
    if (newApplication.rows.length == 0) {
      console.log("Not found application");
    }
    console.log(newApplication);
    res.status(200).send(newApplication.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteApplicationID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteApplication = await pool.query(
    `
    DELETE FROM application WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteApplication.rows.length == 0) {
    console.log("Not found application");
  }
  console.log(deleteApplication);
  res.status(200).send(deleteApplication.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

module.exports = {
  addApplication,
  getApplication,
  getApplicationID,
  updateApplication,
  deleteApplicationID,
};
