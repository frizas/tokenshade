const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(pathname: `/${string}`): string {
  return `${basePath}${pathname}`;
}
