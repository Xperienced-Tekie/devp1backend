import { PrismaClient } from "@prisma/client";
import pkg from "bcryptjs";
const { hash } = pkg;

const db = new PrismaClient();


/**
 * @swagger
 * /register:  
 *   post:
 *     summary: Register a new user.
 *     tags: 
 *         - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - email
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Missing or invalid input.
 *       409:
 *         description: User with the same email or username already exists.
 *       500:
 *         description: Internal server error.
 */

export async function registerUser(req, res) {
  try {
    const { email, username, password } = req.body;

    // Validate fields
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const existingEmail = await db.user.findUnique({
      where: { email: email },
    });

    if (existingEmail) {
      return res.status(409).json({
        user: null,
        message: "user with the same email already exists",
      });
    }

    const existingUsername = await db.user.findUnique({
      where: { username: username },
    });

    if (existingUsername) {
      return res.status(409).json({
        user: null,
        message: "user with the same username already exists",
      });
    }

    const hashedpasskey = await hash(password, 10);
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedpasskey,
      },
    });

    const { password: newuserPassword, ...userResponse } = newUser;

    // Commenting out sending notification mail to the admin
    // await sendMail(
    //   "New User Registration",
    //   "marvineneje@gmail.com",
    //   `
    //   <div style="background-color:#f4f4f4; padding:20px; font-family: Arial, sans-serif;">
    //       <div style="max-width: 600px; margin:0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    //           <h2 style="color:#333; font-size: 24px; margin-top: 0;">New Registration Alert!</h2>
    //           <p>A new user with the username: <b>${username}</b> and email: <b>${email}</b> has just registered.</p>
    //       </div>
    //   </div>
    //   `
    // );

    // Commenting out sending welcome mail to the user
    // await sendMail(
    //   "Welcome to Our Platform",
    //   email,
    //   `
    //   <div style="background-color:#f4f4f4; padding:20px; font-family: Arial, sans-serif;">
    //       <div style="max-width: 600px; margin:0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    //           <h2 style="color:#333; font-size: 24px; margin-top: 0;">Welcome to Our Platform!</h2>
    //           <p><b>Dear ${username},</b></p>
    //           <p>Thank you for registering on our platform. Welcome aboard!</p>
    //       </div>
    //   </div>
    //   `
    // );

    return res
      .status(201)
      .json({ user: userResponse, message: "user created successfully" });
  } catch (error) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({
      message: errorMessage,
      details: error instanceof Error ? error.message : error,
    });
  }
}

