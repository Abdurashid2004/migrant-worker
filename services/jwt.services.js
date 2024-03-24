// `config` modulidan foydalanib kerakli sozlamalarni olish
// va `jsonwebtoken` modulini chaqirish
const config = require("config");
const jwt = require("jsonwebtoken");

// JwtService nomli klassni yaratish
class JwtService {
  // constructor metodi - klassning obyektini yaratish uchun ishlatiladi
  constructor(accessKey, refreshKey, accessTime, refreshTime) {
    // obyektdagi xususiyatlarni belgilash
    this.accessKey = accessKey;
    this.refreshKey = refreshKey;
    this.accessTime = accessTime;
    this.refreshTime = refreshTime;
  }

  // payloadni qabul qilib, tokenlarni generatsiya qiluvchi funksiya
  generationTokens(payload) {
    // accessToken va refreshToken ni generatsiya qilish
    const accessToken = jwt.sign(payload, this.accessKey, {
      expiresIn: this.accessTime,
    });
    const refreshToken = jwt.sign(payload, this.refreshKey, {
      expiresIn: this.refreshTime,
    });

    // generatsiya qilingan tokenlarni qaytarish
    return {
      accessToken,
      refreshToken,
    };
  }

  // accessTokenni tekshirish uchun asinxron funksiya
  async verifyAccessToken(token) {
    // accessTokenni tekshirib berish
    return jwt.verify(token, this.accessKey);
  }

  // refreshTokenni tekshirish uchun asinxron funksiya
  async verifyRefreshToken(token) {
    // refreshTokenni tekshirib berish
    return jwt.verify(token, this.refreshKey);
  }
}

// JwtService klassini eksport qilish
module.exports = new JwtService(
  // config modulidan olingan sozlamalarni kiritish
  config.get("access_key"),
  config.get("refresh_key"),
  config.get("access_time"),
  config.get("refresh_time")
);
