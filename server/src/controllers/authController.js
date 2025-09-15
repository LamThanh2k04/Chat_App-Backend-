    import Users from "../models/userModel.js";
    import bcrypt from "bcrypt";
    import jwt from "jsonwebtoken";
    export const register = async (req,res) => {
        const {firstName, lastName, email, password,confirmPassword} = req.body;
        try {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match" });
            }

            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const imageURL = req.file ? req.file.path : "";

            const newUser = await Users.create({
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                email,
                password: hashedPassword,
                imageURL,
            });
            await newUser.save();
            const token = jwt.sign(
                { id: newUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            )
            res.status(201).json({ token, user: newUser });
        } catch (error) {
            console.error("Error in register:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export const login = async (req,res) => {
        const {email, password} = req.body;
        try {
            const user = await Users.findOne({email});
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            console.log(process.env.JWT_SECRET)
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            )
            res.status(200).json({ token, user });
        } catch (error) {
            console.error("Error in login:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    export const updateProfile = async (req,res) => {
        const {firstName, lastName} = req.body;
        try {
            const user = await Users.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.fullName = `${user.firstName} ${user.lastName}`;
            if (req.file) {
                user.imageURL = req.file.path;
            }
            await user.save();
            res.status(200).json({ message: "Profile updated successfully", user });
        } catch (error) {
            console.error("Error in updateProfile:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
    
    export const checkAuth = async (req,res) => {
        try {
            res.status(200).json({ user: req.user });
        } catch (error) {
            console.error("Error in checkAuth:", error);
            res.status(500).json({ message: "Server error" });
            
        }
    }

   