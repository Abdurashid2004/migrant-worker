const pool = require("../config/db");
const { vacansyValidation } = require("../validations/vacansy");

const addVacansy = async (req, res) => {
  try {

     const { error, value } = vacansyValidation(req.body);

     if (error) {
       return res.status(400).send({ message: error.message });
     }
     console.log(value);

    const {
      employer_id,
      city,
      job_id,
      salary,
      description,
      requirements,
      internship,
      job_type,
      work_hour,
      medecine,
      housing,
      gender,
      age_limit,
      graduate,
      exprience,
      trial_period,
    } = value;

    const newVacansy = await pool.query(
      `
    INSERT INTO vacansy(      
 employer_id,
      city,
      job_id,
      salary,
      description,
      requirements,
      internship,
      job_type,
      work_hour,
      medecine,
      housing,
      gender,
      age_limit,
      graduate,
      exprience,
      trial_period)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        employer_id,
        city,
        job_id,
        salary,
        description,
        requirements,
        internship,
        job_type,
        work_hour,
        medecine,
        housing,
        gender,
        age_limit,
        graduate,
        exprience,
        trial_period,
      ]
    );
    console.log(newVacansy);
    res.status(200).send({ newVacansy });
  } catch (error) {
    console.log(error);
  }
};

const getVacansy = async (req, res) => {
  try {
    const newVacansy = await pool.query(
      `
      SELECT * FROM vacansy
      `
    );
    console.log(newVacansy);
    res.status(200).send({ newVacansy });
  } catch (error) {
    console.log(error);
  }
};

const getVacansyID = async (req, res) => {
  try {
    const { id } = req.params;

    const newVacansy = await pool.query(
      `
        SELECT * FROM vacansy WHERE id=$1,
      `[id]
    );
    if (newVacansy.rows.length == 0) {
      console.log("Not found vacansy");
    }
    console.log(newVacansy);
    res.status(200).send(newVacansy.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

const updateVacansy = async (req, res) => {
  const {
    employer_id,
    city,
    job_id,
    salary,
    description,
    requirements,
    internship,
    job_type,
    work_hour,
    medecine,
    housing,
    gender,
    age_limit,
    graduate,
    exprience,
    trial_period,
  } = req.body;
  const { id } = req.params;
  try {
    const newVacansy = await pool.query(
      `
      UPDATE vacansy SET employer_id=$1, city=$2, job_id=$3, salary=$4, description=$5, 
        requirements=$6, internship=$7, job_type=$8, work_hour=$9, medecine=$10, housing=$11,
        gender=$12, age_limit=$13, graduate=$14, exprience=$15, trial_period=$16 WHERE id=$17 RETURNING *
    `,
      [
        employer_id,
        city,
        job_id,
        salary,
        description,
        requirements,
        internship,
        job_type,
        work_hour,
        medecine,
        housing,
        gender,
        age_limit,
        graduate,
        exprience,
        trial_period,
        id,
      ]
    );
    if (newVacansy.rows.length == 0) {
      console.log("Not found vacansy");
    }
    console.log(newVacansy);
    res.status(200).send(newVacansy.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteVacansyID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteVacansy = await pool.query(
    `
    DELETE FROM vacansy WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteVacansy.rows.length == 0) {
    console.log("Not found vacansy");
  }
  console.log(deleteVacansy);
  res.status(200).send(deleteVacansy.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

module.exports = {
  addVacansy,
  getVacansy,
  getVacansyID,
  updateVacansy,
  deleteVacansyID,
};
