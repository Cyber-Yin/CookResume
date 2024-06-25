import { createCookieSessionStorage, redirect } from "@remix-run/node";

const SESSION_SECRET = process.env.SESSION_SECRET || "s3cr3t";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "SESSIONDATA",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
});

export const createUserSession = async (userId: number, token: string) => {
  const session = await sessionStorage.getSession();

  session.set("userId", userId);
  session.set("token", token);

  const cookieHeader = await sessionStorage.commitSession(session);

  return redirect("/", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
};

export const getUserSession = async (request: Request) => {
  return sessionStorage.getSession(request.headers.get("Cookie"));
};

export const destroyUserSession = async (request: Request) => {
  const session = await getUserSession(request);

  const cookieHeader = await sessionStorage.destroySession(session);

  return redirect("/", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
};
