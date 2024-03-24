const pool = require("../config/db");
const mail_service = require("../services/mail_service");
const bcrypt = require("bcrypt");
const myJwt = require("../services/jwt.services");
const { errorHandler } = require("../helpers/error_handler");
const config = require("config");
const { to } = require("../helpers/to_promise");
const { workerValidation } = require("../validations/worker");
const uuid = require("uuid");

const addWorker = async (req, res) => {
  try {
    const { error, value } = workerValidation(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }
    console.log(value);

    const {
      first_name,
      last_name,
      birth_date,
      gender,
      passport,
      phone_number,
      email,
      tg_link,
      hashed_password,
      hashed_refresh_token,
      is_active,
      graduate,
      skills,
      exprience,
    } = value;

    // const admins = await pool.query("SELECT * FROM worker WHERE email = $1", [
    //   email,
    // ]);
    // if (admins.rows.length)
    //   return res
    //     .status(400)
    //     .send({ message: "Bunday worker avval qo'shilgan" });

    let hashedPassword = bcrypt.hashSync(hashed_password, 7);

    const worker_activation_link = uuid.v4();

    const newWorker = await pool.query(
      `
    INSERT INTO worker(      
      first_name,
      last_name,
      birth_date,
      gender,
      passport,
      phone_number,
      email,
      tg_link,
      hashed_password,
      hashed_refresh_token,
      is_active,
      graduate,
      skills,
      exprience,
      worker_activation_link
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        tg_link,
        hashedPassword,
        hashed_refresh_token,
        is_active,
        graduate,
        skills,
        exprience,
        worker_activation_link,
      ]
    );
    console.log(newWorker);

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/worker/activate/${worker_activation_link}`
    );

    const payload = {
      id: newWorker._id,
    };

    const tokens = myJwt.generationTokens(payload);

    newWorker.hashed_refresh_token = tokens.refreshToken;

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    console.log(tokens);

    res.status(200).send({ payload, ...tokens });
  } catch (error) {
    console.log(error);
  }
};

const workerActivate = async (req, res) => {
  try {
    const worker1 = await pool.query(
      "SELECT * FROM worker WHERE worker_activation_link = $1",
      [req.params.link]
    );
    if (!worker1) {
      return res.status(400).send({ message: "Bunday worker topilamdi" });
    }
    if (worker1.is_active)
      return res.status(400).send({ message: "allaqachon faollashtirildi" });

    worker1.is_active = true;
    res.send({
      is_active: worker1.is_active,
      message: "worker faollashtirildi",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getWorker = async (req, res) => {
  try {
    const newWorker = await pool.query(
      `
      SELECT * FROM worker
      `
    );
    console.log(newWorker);
    res.status(200).send(newWorker.rows);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

//////////////////////////////////////

const loginWorker = async (req, res) => {
  console.log("Logged");
  try {
    const { email, hashed_password } = req.body;

    const worker1 = await pool.query(`select * from worker where email = $1`, [
      email,
    ]);
    const validPass = bcrypt.compareSync(
      hashed_password,
      worker1.rows[0].hashed_password
    );

    if (!validPass) {
      return res.send("Email yoki parol noto'g'ri");
    }
    // console.log("tokens");
    const payload = {
      id: worker1.rows[0].id,
      name: worker1.rows[0].name,
    };

    console.log(payload);

    const tokens = myJwt.generationTokens(payload);
    const author2 = await pool.query(
      `update worker set hashed_refresh_token = $1 where id = $2`,
      [tokens.refreshToken, worker1.rows[0].id]
    );
    console.log(tokens);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    console.log(tokens);

    res.status(200).send(tokens);
  } catch (error) {
    return res.send(error);
  }
};

const logoutWorker = async (req, res) => {
  try {
    if (!req.cookies || !req.cookies.refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refresh token topilmadi" });
    }

    const refreshToken = req.cookies.refreshToken;

    const worker1 = await pool.query(
      "UPDATE worker SET hashed_refresh_token = $1 WHERE hashed_refresh_token = $2 RETURNING *",
      [null, refreshToken]
    );

    if (worker1.rowCount === 0) {
      return res.status(400).send({ message: "Noto'g'ri token" });
    }

    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Sessiya muvaffaqiyatli yakunlandi" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server xatosi" });
  }
};

const refreshWorkerToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }

    const [error, adminDataFromCookie] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(403).send({ message: "Worker ro'yhatdan utmagan" });
    }

    const adminDataFromDB = await pool.query(
      "SELECT * FROM worker WHERE hashed_refresh_token = $1",
      [refreshToken]
    );
    if (adminDataFromDB.rows.length === 0) {
      return res.status(403).send({ message: "Ruxsat etilmagan(Author yo'q)" });
    }

    const payload = {
      id: adminDataFromDB.rows[0].id,
      is_active: adminDataFromDB.rows[0].is_active,
      adminRoles: ["READ", "WRITE"],
    };

    const tokens = myJwt.generationTokens(payload);

    await pool.query(
      "UPDATE worker SET hashed_refresh_token = $1 WHERE hashed_refresh_token = $2",
      [tokens.refreshToken, refreshToken]
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    return res.status(200).send(tokens);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

/////////////////////////////////////

const getWorkerID = async (req, res) => {
  try {
    const { id } = req.params;

    const newWorker = await pool.query(
      `
        SELECT * FROM worker WHERE id=$1,
      `[id]
    );
    if (newWorker.rows.length == 0) {
      console.log("Not found worker");
    }
    console.log(newWorker);
    res.status(200).send(newWorker.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

const updateWorker = async (req, res) => {
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    passport,
    phone_number,
    email,
    tg_link,
    hashed_password,
    hashed_refresh_token,
    is_active,
    graduate,
    skills,
    exprience,
  } = req.body;
  const { id } = req.params;
  try {
    const newWorker = await pool.query(
      `
      UPDATE worker SET first_name=$1, last_name=$2, birth_date=$3, gender=$4, passport=$5, 
        phone_number=$6, email=$7, tg_link=$8, hashed_password=$9, hashed_refresh_token=$10,
        is_active=$11, graduate=$12, skills=$13, exprience=$14 WHERE id=$16 RETURNING *
    `,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        tg_link,
        hashed_password,
        hashed_refresh_token,
        is_active,
        graduate,
        skills,
        exprience,
        id,
      ]
    );
    if (newWorker.rows.length == 0) {
      console.log("Not found worker");
    }
    console.log(newWorker);
    res.status(200).send(newWorker.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const deleteWorkerID = async (req, res) => {
  const { deleteId } = req.params;
  const deleteWorker = await pool.query(
    `
    DELETE FROM worker WHERE id=$1
    `,
    [deleteId]
  );
  if (deleteWorker.rows.length == 0) {
    console.log("Not found worker");
  }
  console.log(deleteWorker);
  res.status(200).send(deleteWorker.rows[0]);

  try {
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

module.exports = {
  addWorker,
  getWorker,
  loginWorker,
  logoutWorker,
  workerActivate,
  refreshWorkerToken,
  getWorkerID,
  updateWorker,
  deleteWorkerID,
};
