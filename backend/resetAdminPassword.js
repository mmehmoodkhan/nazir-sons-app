import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

mongoose.connect("mongodb://127.0.0.1:27017/groceryApp")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


const resetPassword = async () => {

  try {

    const newPassword = "admin@123";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email: "admin@gmail.com" },
      {
        password: hashedPassword
      }
    );

    console.log(result);

    console.log("Admin password updated successfully");

    process.exit();

  } catch(error) {

    console.log(error);
    process.exit();

  }

};


resetPassword();