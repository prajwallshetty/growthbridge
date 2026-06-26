"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "growthbridge_admin_jwt_secret_token_12345";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter your email and password" };
  }

  try {
    await connectToDatabase();

    // Seed or update default admin using environment variables
    const defaultEmail = process.env.ADMIN_EMAIL || "admin@growthbridge.studio";
    const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    const defaultAdmin = await User.findOne({ role: "Super Admin" });
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
    
    if (!defaultAdmin) {
      await User.create({
        name: "Prajwal Shetty",
        email: defaultEmail.toLowerCase(),
        password: hashedDefaultPassword,
        role: "Super Admin",
      });
      console.log(`Default admin seeded: ${defaultEmail}`);
    } else {
      let needsUpdate = false;
      if (defaultAdmin.email !== defaultEmail.toLowerCase()) {
        defaultAdmin.email = defaultEmail.toLowerCase();
        needsUpdate = true;
      }
      
      const isPasswordSame = await bcrypt.compare(defaultPassword, defaultAdmin.password);
      if (!isPasswordSame) {
        defaultAdmin.password = hashedDefaultPassword;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await defaultAdmin.save();
        console.log(`Default admin credentials updated in database to: ${defaultEmail}`);
      }
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Sign JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7200, // 2 hours
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login Server Action Error:", error);
    return { success: false, error: error?.message || "Authentication failed" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
