const pool = require("../config/db");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt.services");
const { errorHandler } = require("../helpers/error_handler");
const config = require("config");
const { to } = require("../helpers/to_promise");
const { employerValidation } = require("../validations/employer");

const addEmployer = async (req, res) => {
  try {
    const { error, value } = employerValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    console.log(value);

    const {
      company_name,
      industry,
      country_id,
      address,
      location,
      contact_name,
      cotact_passport,
      contact_email,
      contact_phone,
      hashed_password,
      hashed_refresh_token,
    } = value;

    const country_ids = await pool.query(`SELECT * FROM country WHERE id=$1`, [
      ,
    ]);

    const admins = await pool.query(
      "SELECT * FROM employer WHERE contact_email = $1",
      [contact_email]
    );

    if (admins.rows.length)
      return res.status(400).send({ message: "Bunday admin avval qo'shilgan" });

    let hashedPassword = bcrypt.hashSync(hashed_password, 7);

    const newEmployer = await pool.query(
      `
    INSERT INTO employer(      
     company_name,
      industry,
      country_id,
      address,
      location,
      contact_name,
      contact_passport,
      contact_email,
      contact_phone,
      hashed_password,
      hashed_refresh_token
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *

    `,
      [
        company_name,
        industry,
        country_id,
        address,
        location,
        contact_name,
        cotact_passport,
        contact_email,
        contact_phone,
        hashedPassword,
        hashed_refresh_token,
      ]
    );
    console.log(newEmployer);
    res.status(200).send({ newEmployer });
  } catch (error) {
    console.log(error);
  }
};

const getEmployer = async (req, res) => {
  try {
    const newEmployer = await pool.query(
      `
      SELECT * FROM employer
      `
    );
    console.log(newEmployer);
    res.status(200).send({ newEmployer });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

///////////////////////////////////////////

const loginEmployer = async (req, res) => {
  try {
    const { contact_email, hashed_password } = req.body;

    // Validate inputs
    if (!contact_email || !hashed_password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    // Check if admin exists
    const emloyres = await pool.query(
      "SELECT * FROM employer WHERE contact_email = $1",
      [contact_email]
    );
    if (emloyres.rows.length === 0) {
      return res.status(400).send({ message: "Incorrect email or passwordA" });
    }

    // Compare passwords
    const validPassword = bcrypt.compareSync(
      hashed_password,
      emloyres.rows[0].hashed_password
    );
    if (!validPassword) {
      return res.status(400).send({ message: "Incorrect email or passwordS" });
    }

    // Generate JWT tokens
    const payload = {
      id: emloyres.rows[0].id,
      is_creator: emloyres.rows[0].is_creator,
    };
    const tokens = myJwt.generationTokens(payload);

    // Update hashed refresh token in the database
    await pool.query(
      "UPDATE admin SET hashed_refresh_token = $1, is_active = true WHERE id = $2",
      [tokens.refreshToken, emloyres.rows[0].id]
    );

    // Set refresh token as a cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    // Send tokens as response
    res.status(200).send(tokens);
  } catch (error) {
    console.error("Error in loginAdmin:", error);
    res.status(500).send({ message: error });
  }
};

const logoutEmployer = async (req, res) => {
  try {
    if (!req.cookies || !req.cookies.refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refresh token topilmadi" });
    }

    const refreshToken = req.cookies.refreshToken;

    const admin1 = await pool.query(
      "UPDATE admin SET hashed_refresh_token = $1 WHERE hashed_refresh_token = $2 RETURNING *",
      [null, refreshToken]
    );

    if (admin1.rows.length === 0) {
      return res.status(400).send({ message: "Noto'g'ri token" });
    }

    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Sessiya muvaffaqiyatli yakunlandi" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server xatosi" });
  }
};

const refreshEmployerToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }

    const [error, adminDataFromCookie] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(403).send({ message: "Admin ro'yhatdan utmagan" });
    }

    const adminDataFromDB = await pool.query(
      "SELECT * FROM admin WHERE hashed_refresh_token = $1",
      [refreshToken]
    );
    if (adminDataFromDB.rows.length === 0) {
      return res.status(403).send({ message: "Ruxsat etilmagan(Author yo'q)" });
    }

    const payload = {
      id: adminDataFromDB.rows[0].id,
      is_active: adminDataFromDB.rows[0].is_active,
    };

    const tokens = myJwt.generationTokens(payload);

    await pool.query(
      "UPDATE admin SET hashed_refresh_token = $1 WHERE hashed_refresh_token = $2",
      [tokens.refreshToken, refreshToken]
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    return res.status(200).send(tokens);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
};

///////////////////////////////////////////////

const getEmployerID = async (req, res) => {
  try {
    const { id } = req.params;

    const newEmployer = await pool.query(
      `
        SELECT * FROM employer WHERE id=$1,
      `[id]
    );
    if (newEmployer.rows.length == 0) {
      console.log("Not found employer");
    }
    console.log(newEmployer);
    res.status(200).send(newEmployer.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const updateEmployer = async (req, res) => {
  const {
    company_name,
    industry,
    country_id,
    address,
    location,
    contact_name,
    cotact_passport,
    contact_email,
    contact_phone,
    hashed_password,
    hashed_refresh_token,
  } = req.body;
  const { id } = req.params;
  try {
    const newEmployer = await pool.query(
      `
      UPDATE employer SET company_name=$1, industry=$2,  address=$3, location=$4, contact_name=$5, 
      cotact_passport=$6, contact_email=$7, contact_phone=$8, hashed_password=$9, hashed_refresh_token=$10 country_id=$11 WHERE id=$12 RETURNING *
    `,
      [
        company_name,
        industry,
        address,
        location,
        contact_name,
        cotact_passport,
        contact_email,
        contact_phone,
        hashed_password,
        hashed_refresh_token,
        country_id,
        id,
      ]
    );
    if (newEmployer.rows.length == 0) {
      console.log("Not found employer");
    }
    console.log(newEmployer);
    res.status(200).send(newEmployer.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const deleteEmployerID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteEmployer = await pool.query(
    `
    DELETE FROM employer WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteEmployer.rows.length == 0) {
    console.log("Not found employer");
  }
  console.log(deleteEmployer);
  res.status(200).send(deleteEmployer.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

module.exports = {
  addEmployer,
  getEmployer,
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
  getEmployerID,
  updateEmployer,
  deleteEmployerID,
};
