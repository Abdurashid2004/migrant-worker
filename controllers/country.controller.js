const pool = require("../config/db");
const { countryValidation } = require("../validations/country");

// const addCountry = async (req, res) => {
//   try {
//     const { error, value } = countryValidation(req.body);

//     if (error) {
//       return res.status(400).send({ message: error.message });
//     }
//     console.log(value);

//     const { name, flag } = value;

//     const newCountry = await pool.query(
//       `INSERT INTO country(name, flag) VALUES($1, $2) RETURNING * `,
//       [name, flag]
//     );
//     console.log(newCountry);
//     res.status(200).send({ newCountry });
//   } catch (error) {
//     console.log(error);
//   }
// };
const addCountry = async (req, res) => {
  try {
    const { error, value } = countryValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const { name, flag } = value;

    const newCountry = await pool.query(
      `INSERT INTO country( name, flag) VALUES ($1, $2) RETURNING * `,
      [name, flag]
    );

    res.status(200).send({ newCountry: newCountry.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

const getCountry = async (req, res) => {
  try {
    const newCountry = await pool.query(
      `
      SELECT * FROM country
      `
    );
    console.log(newCountry);
    res.status(200).send({ newCountry });
  } catch (error) {
    console.log(error);
  }
};

const getCountryID = async (req, res) => {
  try {
    const { id } = req.params;

    const newCountry = await pool.query(
      `
        SELECT * FROM country WHERE id=$1,
      `[id]
    );
    if (newCountry.rows.length == 0) {
      console.log("Not found country");
    }
    console.log(newCountry);
    res.status(200).send(newCountry.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

const updateCountry = async (req, res) => {
  const { name, flag } = req.body;
  const { id } = req.params;
  try {
    const newCountry = await pool.query(
      `UPDATE country SET name=$1, flag=$2 WHERE id=$3 RETURNING * `,
      [name, flag, id]
    );
    if (newCountry.rows.length == 0) {
      console.log("Not found country");
    }
    console.log(newCountry);
    res.status(200).send(newCountry.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteCountryID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteCountry = await pool.query(
    `
    DELETE FROM country WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteCountry.rows.length == 0) {
    console.log("Not found country");
  }
  console.log(deleteCountry);
  res.status(200).send(deleteCountry.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

module.exports = {
  addCountry,
  getCountry,
  getCountryID,
  updateCountry,
  deleteCountryID,
};
