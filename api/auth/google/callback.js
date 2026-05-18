const app = require("../../server");

module.exports = (req, res) => {
  req.url = "/auth/google/callback";
  return app(req, res);
};
