import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/session";

// The session cookie exists but the API rejected the token (expired, user
// deleted...). Cookies can't be deleted while a page renders, so pages redirect
// here: clear the cookie, then go to login. Without this the login page would
// see the cookie and send the user straight back, causing a redirect loop.
export async function GET() {
  await clearSessionCookie();
  redirect("/login");
}
