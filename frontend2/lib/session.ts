import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET || "ERGK2KGcOOAs7P=D=O51_Z,68xt0+AnvsQMIwU4m6ba03B";
const key = new TextEncoder().encode(SECRET_KEY);

const COOKIE_NAME = "session_token";

export async function createSession(payload: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 dan
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);

  (await cookies()).set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}