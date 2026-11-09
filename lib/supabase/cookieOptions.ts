export const COOKIE_OPTIONS = {
  // JavaScriptから読めなくする
  httpOnly: true,
  // 本番環境ではHTTPS通信のときだけCookieをつける
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};