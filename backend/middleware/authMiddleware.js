const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "Niste autorizirani, token nije ispravan" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Niste autorizirani, nema tokena" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Pristup odbijen. Vaša uloga (${req.user.role}) nema ovlasti za ovu akciju.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
