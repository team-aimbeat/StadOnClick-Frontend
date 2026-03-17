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
  if (roles.includes("VENDOR")) {
    return "/vendor/dashboard";
  }
  if (roles.includes("AFFILIATE")) {
    return "/affiliate/dashboard";
  }
  return "/marketplace";
}
