const jwt = require("jsonwebtoken");
const db = require("../../utils/database");
const SECRET_KEY = "secret123";

class Middleware {
  async authorization(req, res, next) {
    try {
      const token = await req.headers["authorization"];

      if (!token) {
        return res.status(403).send({ message: "No token provided!" });
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
    } catch (error) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    next();
  }

  async isAdmin(req, res, next) {
    try {
      // if (!req.user || !req.user.user_id) {
      //     return res.status(401).send({ message: "Unauthorized!" });
      // }

      const email = req.body.email;

      console.log("email -----", email);

      const [role] = await db.execute(
        `SELECT group_concat(urm.roleId) AS roles
               FROM user_info AS ui
               INNER JOIN user_role_mapping AS urm ON ui.id = urm.userId 
               WHERE ui.email = ?
               GROUP BY ui.id `,
        [email]
      );

      if (!role?.[0]?.roles?.includes("1")) {
        return res
          .status(403)
          .send({ message: "You are not authorized to access this resource!" });
      }
      next();
    } catch (error) {
      console.log("Error in isAdmin middleware:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = new Middleware();
