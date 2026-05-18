const app = require("../../server");

module.exports = (req, res) => {
  req.url = "/auth/google";
  return app(req, res);
};
