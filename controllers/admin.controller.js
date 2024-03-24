const pool = require("../config/db");
const { adminValidation } = require("../validations/admin");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt.services");
const { errorHandler } = require("../helpers/error_handler");
const config = require("config");
const { to } = require("../helpers/to_promise");

const addAdmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    console.log(value);

    const {
      name,
      email,
      phone_number,
      hashed_password,
      tg_link,
      description,
      is_active,
      is_creator,
      hashed_refresh_token,
    } = value;

    const admins = await pool.query("SELECT * FROM admin WHERE email = $1", [
      email,
    ]);
    if (admins.rows.length)
      return res.status(400).send({ message: "Bunday admin avval qo'shilgan" });

    let hashedPassword = bcrypt.hashSync(hashed_password, 7);

    const newAdmin = await pool.query(
      `
    INSERT INTO admin(      
      name,
      email,
      phone_number,
      hashed_password,
      tg_link,
      description,
      is_active,
      is_creator,
      hashed_refresh_token)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *

    `,
      [
        name,
        email,
        phone_number,
        hashedPassword,
        tg_link,
        description,
        is_active,
        is_creator,
        hashed_refresh_token,
      ]
    );

    console.log(newAdmin);
    res.status(200).send({ newAdmin });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAdmin = async (req, res) => {
  try {
    const newAdmin = await pool.query(
      `
      SELECT * FROM admin
      `
    );
    console.log(newAdmin);
    res.status(200).send({ newAdmin });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};
/////////////////////////////////////////////////////

const loginAdmin = async (req, res) => {
  try {
    const { email, hashed_password } = req.body;

    // Validate inputs
    if (!email || !hashed_password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    // Check if admin exists
    const admin = await pool.query("SELECT * FROM admin WHERE email = $1", [
      email,
    ]);
    if (admin.rows.length === 0) {
      return res.status(400).send({ message: "Incorrect email or password" });
    }

    // Compare passwords
    const validPassword = bcrypt.compareSync(
      hashed_password,
      admin.rows[0].hashed_password
    );
    if (!validPassword) {
      return res.status(400).send({ message: "Incorrect email or password" });
    }

    // Generate JWT tokens
    const payload = {
      id: admin.rows[0].id,
      is_active: admin.rows[0].is_active,
      // is_creator: admin.rows[0].is_creator,
    };
    const tokens = myJwt.generationTokens(payload);

    // Update hashed refresh token in the database
    await pool.query(
      "UPDATE admin SET hashed_refresh_token = $1, is_active = true WHERE id = $2",
      [tokens.refreshToken, admin.rows[0].id]
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
    res.status(500).send({ message: "Server error" });
  }
};


const logoutAdmin = async (req, res) => {
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

const refreshAdminToken = async (req, res) => {
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

///////////////////////////////////////////

const getAdminID = async (req, res) => {
  try {
    const { id } = req.params;

    const newAdmin = await pool.query(
      `
        SELECT * FROM admin WHERE id=$1,
      `[id]
    );
    if (newAdmin.rows.length == 0) {
      console.log("Not found admin");
    }
    console.log(newAdmin);
    res.status(200).send(newAdmin.rows[0]);
  } catch (error) {
    errorHandler(res, error);
    console.log(error);
  }
};

const updateAdmin = async (req, res) => {
  const {
    name,
    email,
    phone_number,
    hashed_password,
    tg_link,
    description,
    is_active,
    is_creator,
    hashed_refresh_token,
  } = req.body;
  const { id } = req.params;
  try {
    const newAdmin = await pool.query(
      `
      UPDATE admin SET name=$1, email=$2,  phone_number=$3, hashed_password=$4, tg_link=$5, 
      description=$6, is_active=$7, is_creator=$8, hashed_refresh_token=$9  WHERE id=$10 RETURNING *
    `,
      [
        name,
        email,
        phone_number,
        hashed_password,
        tg_link,
        description,
        is_active,
        is_creator,
        hashed_refresh_token,
        id,
      ]
    );
    if (newAdmin.rows.length == 0) {
      console.log("Not found admin");
    }
    console.log(newAdmin);
    res.status(200).send(newAdmin.rows[0]);
  } catch (error) {
    errorHandler(res, error);

    console.log(error);
    res.status(500).json("Serverda xatolik");
  }
};

const deleteAdminID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteAdmin = await pool.query(
    `
    DELETE FROM admin WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteAdmin.rows.length == 0) {
    console.log("Not found admin");
  }
  console.log(deleteAdmin);
  res.status(200).send(deleteAdmin.rows[0]);

  try {
  } catch (error) {
    errorHandler(res, error);
    console.log(error);
  }
};

module.exports = {
  addAdmin,
  getAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  getAdminID,
  updateAdmin,
  deleteAdminID,
};
