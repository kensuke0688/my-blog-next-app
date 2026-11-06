export const COOKIE_OPTIONS = {
  // JavaScriptから読めなくする
  httpOnly: true,
  // 本番環境ではHTTPS通信のときだけCookieをつける
  secure: process.env.NODE_ENV === "production",
  // CSRFを緩和する
  sameSite: "lax" as const,
};