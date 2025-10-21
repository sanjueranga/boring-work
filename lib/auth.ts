import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface Session {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error("AUTH_SECRET environment variable is not set");
}
const key = new TextEncoder().encode(secretKey);

async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  const session = await decrypt(sessionCookie);
  return session;
}

export async function setSession(session: Session) {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const sessionToken = await encrypt(session);
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
}
