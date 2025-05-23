import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const payload = {
    user: {
      id,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
