"use server";

import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getSessionUser, logActivity } from "@/lib/actions/cms";

// Helper: Ensure the active user is an Admin or Super Admin
async function requireAdmin() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized. Please log in.");
  }
  if (sessionUser.role !== "Super Admin" && sessionUser.role !== "Admin") {
    throw new Error("Forbidden. Only Admins can manage users.");
  }
  return sessionUser;
}

// Serialize helper to avoid Next.js payload issues
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Get all users
export async function getUsers() {
  await requireAdmin();
  await connectToDatabase();
  const list = await User.find().sort({ role: 1, name: 1 }).lean();
  return serialize(list);
}

// Create or update a user
export async function saveUser(data: any) {
  const sessionUser = await requireAdmin();
  await connectToDatabase();

  const { _id, name, email, role, password } = data;

  if (!name || !email || !role) {
    throw new Error("Name, email, and role are required.");
  }

  let user;

  if (_id) {
    // Update existing user
    user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if email already exists on a different user
    const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: _id } });
    if (existingEmail) {
      throw new Error("Email address already in use by another account.");
    }

    user.name = name;
    user.email = email.toLowerCase();
    user.role = role;

    // If new password is provided, hash it
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    await logActivity(`Updated user account details: "${user.name}" (${user.role})`);
  } else {
    // Create new user
    if (!password || password.trim() === "") {
      throw new Error("Password is required for new users.");
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new Error("Email address already in use.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email: email.toLowerCase(),
      role,
      password: hashedPassword,
    });

    await logActivity(`Created new user account: "${user.name}" as ${user.role}`);
  }

  return serialize(user);
}

// Delete a user
export async function deleteUser(id: string) {
  const sessionUser = await requireAdmin();
  await connectToDatabase();

  // Block deleting oneself
  if (sessionUser.userId === id) {
    throw new Error("Cannot delete your own account while logged in.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found.");
  }

  // Prevent editing/deleting Super Admin unless logged in as Super Admin
  if (user.role === "Super Admin" && sessionUser.role !== "Super Admin") {
    throw new Error("Only Super Admins can delete other Super Admins.");
  }

  await User.findByIdAndDelete(id);
  await logActivity(`Deleted user account: "${user.name}" (${user.role})`);

  return { success: true };
}
