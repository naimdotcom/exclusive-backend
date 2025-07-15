const jwt = require("jsonwebtoken");

const verifyAuth = async (req, res, next) => {
  try {
    if (req.headers.cookie) {
      const tokenRegx = /(?<=exclusiveToken=)[\w-]+\.[\w-]+\.[\w-]+/;
      const token = req.headers.cookie.match(tokenRegx)[0];

      const decoded = jwt.verify(token, process.env.TOKEN_SECRECT);
      if (!decoded) {
        res.status(401).json({ msg: "invalid Token", verified: false });
      }
      req.user = decoded;
      next();
    } else if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "").trim();
      const decoded = jwt.verify(token, process.env.TOKEN_SECRECT);
      if (!decoded) {
        res.status(401).json({ msg: "invalid Token", verified: false });
      }
      req.user = decoded;
      next();
    } else {
      res.status(401).json({ message: "Token Missing ", verified: false });
    }
  } catch (error) {
    console.error("error form authguard middleware", error);
    res
      .status(401)
      .json({ message: "Token expired or invalid ", verified: false });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (req.headers.cookie) {
      const token = req.headers.cookie.replace("exclusiveToken=", "").trim();
      const decoded = jwt.verify(token, process.env.ADMIN_TOKEN_SECRECT);
      if (!decoded) {
        res.status(401).json({ msg: "invalid Token", verified: false });
      }
      req.admin = decoded;
      next();
    } else if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "").trim();
      const decoded = jwt.verify(token, process.env.ADMIN_TOKEN_SECRECT);
      if (!decoded) {
        res.status(401).json({ msg: "invalid Token", verified: false });
      }
      req.admin = decoded;
      next();
    } else {
      res.status(401).json({ message: "Token Missing ", verified: false });
    }
  } catch (error) {
    console.log("error form authguard admin middleware", error);
    res
      .status(401)
      .json({ message: "Token expired or invalid ", verified: false });
  }
};

module.exports = { verifyAuth, verifyAdmin };
