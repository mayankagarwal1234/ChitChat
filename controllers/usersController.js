const User = require("../model/userModel");
const bcrypt = require("bcryptjs");


module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Incorrect Email or Password", status: false });
    }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // If password is incorrect, return error message
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Incorrect Email or Password", status: false });
    }
    // If login is successful, remove password from user object (for security) and return user data
    const userData = { ...user._doc };
    delete userData.password;
    
    return res.json({ status: true, user: userData });
    
  } catch (ex) {
    next(ex); 
  }
};

module.exports.register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck)
        return res.json({ msg: "Username already used", status: false });
      const emailCheck = await User.findOne({ email });
      if (emailCheck)
        return res.json({ msg: "Email already used", status: false });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
  };
  module.exports.setAvatar = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (ex) {
      next(ex);
    }
  };
  module.exports.getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find({ _id: { $ne: req.params.id } }).select([
        "email",
        "username",
        "avatarImage",
        "_id",
      ]);
      return res.json(users);
    } catch (ex) {
      next(ex);
    }
  };
  module.exports.logOut = (req, res, next) => {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({ msg: "User ID is required" });
      }
  
      // Assuming onlineUsers is a Map or similar data structure
      if (!onlineUsers.has(userId)) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      onlineUsers.delete(userId);
      return res.status(200).json({ msg: "Logout successful" });
    } catch (ex) {
      console.error("Error during logout: ", ex);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  