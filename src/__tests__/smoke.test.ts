import { NAV_LINKS } from "../constants/app-constants";
import { API_BASE } from "../config/api";

describe("smoke", () => {
  test("NAV_LINKS contains expected routes", () => {
    const publicPaths = NAV_LINKS.public.map((l: { path: string }) => l.path);
    const authedPaths = NAV_LINKS.authenticated.map((l: { path: string }) => l.path);

    expect(publicPaths).toEqual(expect.arrayContaining(["/", "/collection", "/login"]));
    expect(authedPaths).toEqual(expect.arrayContaining(["/", "/collection", "/dashboard"]));
  });

  test("API_BASE is a string", () => {
    expect(typeof API_BASE).toBe("string");
  });
});
