const UserHelper = require("../helper/helper");
const response = require("../../utils/response");
const userValidator = require("../validator/validator");

class UserController {
  async signUp(req, res) {
    try {
      await userValidator.signUp(req.body);
      const result = await UserHelper.signUp(req.body);
      response.sendSuccess(res, result, "User signed up successfully. Please verify your email.");
    } catch (error) {
      response.sendError(res, error);
    }
  }

  async verifyEmail(req, res) {
    try {
      const token = req.query.token;
      const userId = req.query.userId;

      if (!token || !userId) {
        throw new Error("Token and userId are required.");
      }

      const isUpdated = await UserHelper.updateEmailVerificationStatus(userId, token);

      if (isUpdated) {
        response.sendSuccess(res, {} , "Email verified successfully.");
      } else {
        throw new Error("Failed to verify email.");
      }
    } catch (error) {
      response.sendError(res, error);
    }
  }

  async loginUser(req, res) {
    try {
      await userValidator.validateLogin(req.body);
      const token = await UserHelper.loginUser(req.body);
      response.sendSuccess(res, { token: token });
    } catch (error) {
      response.sendError(res, error);
    }
  }
  
  async adminLogin(req, res) {
    try {
      await userValidator.validateAdminLogin(req.body);
      const token = await UserHelper.adminLogin(req.body);
      response.sendSuccess(res, { token: token });
    } catch (error) {
      response.sendError(res, error);
    }
  }

}

module.exports = new UserController();
