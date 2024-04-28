const db = require("../../utils/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../../utils/mailHelper");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const moment = require("moment");

const SECRET_KEY = "secret123";

class UserHelper {
  async signUp(body) {    
    try {
      const { firstName, lastName, email, password, role } = body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

      const [resultUser] = await db.execute(
        "INSERT INTO user_info (firstName, lastName, email, password, createdAt) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword, createdAt]
      );

      await db.execute(
        "INSERT INTO user_role_mapping (userId, roleId, createdAt) VALUES (?, ?, ?)",
        [resultUser.insertId, role, createdAt]
      );

      const userData = { userId: resultUser.insertId };

      const verificationToken = jwt.sign(userData, SECRET_KEY, {
        expiresIn: "24h",
      });

      const verificationLink = `http://abcdef.com/api/users/verify-email?token=${verificationToken}&userId=${resultUser.insertId}`;

      const emailTemplate = ejs.render(
        fs.readFileSync(
          path.resolve(__dirname, "../../public/template/emailTemplate.ejs"),
          "utf8"
        ),
        { verificationLink }
      );

      await transporter.sendMail({
        from: "vatskachhadiya@gmail.com",
        to: email,
        subject: "Email Verification",
        html: emailTemplate,
      });

      return { userId: resultUser.insertId };
    } catch (error) {
      console.log("Error in signUp:", error);
      throw error;
    }
  }

  async updateEmailVerificationStatus(userId, token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      if (decoded.userId !== parseInt(userId)) {
        throw new Error("Invalid token");
      }

      const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      await db.execute("UPDATE user_info SET isVerified = ?, updatedAt = ?, updatedBy = ? WHERE id = ?", [1, updatedAt, decoded.userId, userId]);

      return true;
    } catch (error) {
      console.log("Error in updateEmailVerificationStatus:", error);
      throw error;
    }
  }

  async loginUser(body) {
    try {
      const { email, password } = body;
      const [user] = await db.execute("SELECT * FROM user_info WHERE email = ?", [email]);

      if (!user.length) {
        throw new Error("Invalid credentials");
      }


      if (user[0].isVerified == 0) {
        throw new Error("Please verify your email");
      }

      const hashedPassword = user[0].password;
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (!passwordMatch) {
        throw new Error("Invalid credentials");
      }

      const userData = { id: user[0].id, email: user[0].email };
      const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });

      return token;
    } catch (error) {
      console.log("Error ::", error);
      throw error;
    }
  }

  async adminLogin(body) {
    try {
      const { email, password } = body;
      const [user] = await db.execute("SELECT * FROM user_info WHERE email = ?", [email]);

      if (!user.length) {
        throw new Error("Invalid credentials");
      }

      if (user[0].isVerified == 0) {
        throw new Error("Please verify your email");
      }

      const hashedPassword = user[0].password;
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (!passwordMatch) {
        throw new Error("Invalid credentials");
      }

      const userData = { user_id: user[0].id, email: user[0].email };
      const token = jwt.sign(userData, SECRET_KEY, { expiresIn: "24h" });

      return token;
    } catch (error) {
      console.log("Error ::", error);
      throw error;
    }
  }
}

module.exports = new UserHelper();
