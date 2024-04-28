const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "vatskachhadiya@gmail.com",
    pass: "ulxqylliutdglmkb",
  },
});

module.exports = transporter;
