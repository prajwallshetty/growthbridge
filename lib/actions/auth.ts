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

  const defaultEmail = (process.env.ADMIN_EMAIL || "admin@growthbridge.studio").toLowerCase();
  const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";

  try {
    try {
      await connectToDatabase();
    } catch (dbError: any) {
      console.warn("Database connection failed. Falling back to env-variable authentication.", dbError?.message);
      if (email.toLowerCase() === defaultEmail && password === defaultPassword) {
        // Sign JWT with mock userId for offline bypass
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new jose.SignJWT({
          userId: "offline_admin_bypass_id",
          email: defaultEmail,
          role: "Super Admin",
          name: "Prajwal Shetty (Offline)",
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30d")
          .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return { success: true };
      }
      return { success: false, error: "Database offline and credentials mismatched." };
    }

    // Database is online: seed or update default admin
    const defaultAdmin = await User.findOne({ role: "Super Admin" });
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
    
    if (!defaultAdmin) {
      await User.create({
        name: "Prajwal Shetty",
        email: defaultEmail,
        password: hashedDefaultPassword,
        role: "Super Admin",
      });
      console.log(`Default admin seeded: ${defaultEmail}`);
    } else {
      let needsUpdate = false;
      if (defaultAdmin.email !== defaultEmail) {
        defaultAdmin.email = defaultEmail;
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
      .setExpirationTime("30d")
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
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
