import { TestBed } from "@angular/core/testing";
import { expect } from "@jest/globals";
import { of } from "rxjs";
import { Router } from "@angular/router";

import { AppComponent } from "./app.component";
import { SessionService } from "./core/service/session.service";
import { AuthService } from "./core/service/auth.service";

describe("AppComponent (integration)", () => {
  const routerMock = { navigate: jest.fn() } as unknown as Router;

  const sessionServiceMock = {
    $isLogged: jest.fn(),
    logOut: jest.fn(),
  } as unknown as SessionService;

  const authServiceMock = {} as unknown as AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    sessionServiceMock.$isLogged = jest.fn().mockReturnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [AppComponent], // standalone => imports, pas declarations
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("$isLogged should expose SessionService stream", (done) => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.$isLogged().subscribe((v) => {
      expect(v).toBe(true);
      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
      done();
    });
  });

  it("logout should call SessionService.logOut and navigate to ''", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.logout();

    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith([""]);
  });
});
