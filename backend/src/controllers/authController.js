const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const {username, email, password, cfpassword} = req.body;

        if(!username || !email || !password || !cfpassword){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password != cfpassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const existUser = await User.findOne({
            $or: [{username}, {email}]
        });

        if(existUser){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({username, email, password:hashedPassword});

        res.status(201).json({
            message: "Register successful"
        })
    } catch (err){
        console.error("Register error:", err);
        res.status(500).json({message: "Server error"});
    }
}

exports.login = async(req, res) => {
    try {
        const {username, password, remember} = req.body;

        const usernameStr = typeof username === 'string' ? username : '';

        const user = await User.findOne({
            username: usernameStr
        });
        
        if(!user) return res.status(400).json({message: "Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign(
            {id: user._id}, process.env.JWT_SECRET, {expiresIn: remember? "2d": "1h"}
        );

        res.cookie("token", token,{
            httpOnly: true,
            secure:false, //change true when deploy HTTPS
            sameSite: "lax",
            maxAge: remember ? 2*24*60*60*1000:60*60*1000
        });

        res.json({message: "Login successful"});

    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
}

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      authenticated: true,
      user: { id: String(user._id), username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false, path: "/"});
    res.json({message: "Logged out"});
}