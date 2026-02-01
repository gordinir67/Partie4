import { routes } from "./app.routes";
import { expect } from "@jest/globals";
import { AuthGuard } from "./guards/auth.guard";
import { UnauthGuard } from "./guards/unauth.guard";

describe("routes (unit)", () => {
  it("should redirect '' to login", () => {
    const root = routes.find((r) => r.path === "");
    expect(root).toBeTruthy();
    expect(root?.redirectTo).toBe("login");
    expect(root?.pathMatch).toBe("full");
  });

  it("should protect login & register with UnauthGuard", () => {
    const login = routes.find((r) => r.path === "login");
    const register = routes.find((r) => r.path === "register");
    expect(login?.canActivate).toEqual([UnauthGuard]);
    expect(register?.canActivate).toEqual([UnauthGuard]);
  });

  it("should protect sessions & me with AuthGuard", () => {
    const sessions = routes.find((r) => r.path === "sessions");
    const me = routes.find((r) => r.path === "me");
    expect(sessions?.canActivate).toEqual([AuthGuard]);
    expect(me?.canActivate).toEqual([AuthGuard]);

    const children = sessions?.children ?? [];
    expect(children.some((c) => c.path === "")).toBe(true);
    expect(children.some((c) => c.path === "detail/:id")).toBe(true);
    expect(children.some((c) => c.path === "create")).toBe(true);
    expect(children.some((c) => c.path === "update/:id")).toBe(true);
  });

  it("should have a 404 route and wildcard redirect", () => {
    const notFound = routes.find((r) => r.path === "404");
    const wildcard = routes.find((r) => r.path === "**");
    expect(notFound).toBeTruthy();
    expect(wildcard?.redirectTo).toBe("404");
  });
});
