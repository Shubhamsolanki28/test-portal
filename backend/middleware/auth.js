import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // JWT_SECRET_KEY must be identical to Dexmy FastAPI secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireTestCreator = (req, res, next) => {
  if (req.user && req.user.role === "test_creator") {
    next();
  } else {
    res.status(403).json({ message: "Test Creator access required" });
  }
};

export const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    res.status(403).json({ message: "Student access required" });
  }
};

export default authMiddleware;
