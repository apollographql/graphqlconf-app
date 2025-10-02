/**
 * Generate cookie options with Secure flag only for HTTPS
 */
export function getCookieOptions(
  request: Request,
  maxAge: number
): string {
  const url = new URL(request.url);
  const isSecure = url.protocol === "https:";
  const secureFlag = isSecure ? "Secure; " : "";

  return `HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}
