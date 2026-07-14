import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const createAdmin = async () => {

  try {

    await mongoose.connect(
      "mongodb://127.0.0.1:27017/groceryApp"
    );

    const password = await bcrypt.hash(
      "Admin123",
      10
    );


    const admin = await User.create({

      name: "Admin",

      email: "admin@gmail.com",

      password: password,

      role: "admin",

      isVerified: true,

      isBlocked: false,

      provider: "local"

    });


    console.log("Admin Created Successfully");
    console.log(admin);


    process.exit();


  } catch(error){

    console.log(error);
    process.exit(1);

  }

};


createAdmin();