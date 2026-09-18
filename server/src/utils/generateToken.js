import jwt from "jsonwebtoken";

const generateToken = (id, role = "USER") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "devtinder_jwt_secret_key_2026",
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;