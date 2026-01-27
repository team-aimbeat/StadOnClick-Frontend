export function getPostLoginRoute(roles: string[] = []): string {
  if (roles.includes("ADMIN")) {
    return "/admin/dashboard";
  }
  if (roles.includes("SUPPORT_ADMIN")) {
    return "/admin/support";
  }
  if (roles.includes("MODERATOR")) {
    return "/admin/moderator/dashboard";
  }
  return "/access-denied";
}
