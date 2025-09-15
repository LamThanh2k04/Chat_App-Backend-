import jwt from "jsonwebtoken";
import Users from "../models/userModel.js";

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        console.log(process.env.JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.id).select("-password"); // <- Thêm await
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Token verification error:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};

