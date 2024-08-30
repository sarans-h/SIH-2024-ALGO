require("dotenv").config();
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { existsSync, unlinkSync } = require("fs");

const userExists = async (email) => {
  return await User.findOne({ email });
};

const findUsers = async () => {
  return await User.find();
};

const findUserById = async (id) => {
  return await User.findById(id);
};

const registerUser = async (
  fullName,
  age,
  email,
  username,
  password,
  image,
  role,
  desc // Added desc parameter
) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
// console.log(fullName);
// console.log(desc);


  if (existingUser) {
    return null; // User already exists
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName,
    age,
    email,
    username,
    password: hashedPassword,
    role,
    image: image || "no-image.png",
    desc: desc || "", // Set description, default to empty string if not provided
  });

  return await newUser.save();
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '1h' });
    return { token, user };
  }

  return null; // Authentication failed
};

const updateUser = async (
  userId,
  fullName,
  age,
  username,
  image,
  imageFile,
  desc // Added desc parameter
) => {
  const user = await findUserById(userId);

  if (!user) {
    return null; // User not found
  }

  let newImage = user.image;

  if (image !== undefined) {
    if (image === "no-image.png" && imageFile === undefined) {
      if (existsSync(`./uploads/Users_imgs/${user.image}`) && user.image !== "no-image.png") {
        unlinkSync(`./uploads/Users_imgs/${user.image}`);
      }
      newImage = "no-image.png";
    } else if (image === null && imageFile) {
      if (existsSync(`./uploads/Users_imgs/${user.image}`) && user.image !== "no-image.png") {
        unlinkSync(`./uploads/Users_imgs/${user.image}`);
      }
      newImage = imageFile;
    } else {
      newImage = image || user.image;
    }
  }

  return await User.updateOne(
    { _id: userId },
    { fullName, age, username, image: newImage, desc: desc || user.desc }
  );
};

module.exports = {
  userExists,
  findUserById,
  findUsers,
  registerUser,
  loginUser,
  updateUser,
};
