import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { expect } from "@jest/globals";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

import { MeComponent } from "./me.component";
import { SessionService } from "src/app/core/service/session.service";
import { UserService } from "src/app/core/service/user.service";

describe("MeComponent (integration)", () => {
  const routerMock = { navigate: jest.fn() } as unknown as Router;
  const snackMock = { open: jest.fn() } as unknown as MatSnackBar;

  const sessionServiceMock = {
    sessionInformation: { id: 7, admin: false, token: "t", username: "u" },
    logOut: jest.fn(),
  } as unknown as SessionService;

  const userServiceMock = {
    getById: jest.fn(),
    delete: jest.fn(),
  } as unknown as UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    userServiceMock.getById = jest.fn().mockReturnValue(of({ id: 7, email: "a@a.com", firstName: "A", lastName: "B", admin: false }));
    userServiceMock.delete = jest.fn().mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();
  });

  it("ngOnInit should load user", () => {
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // déclenche ngOnInit

    expect(userServiceMock.getById).toHaveBeenCalledWith("7");
    expect(component.user).toBeTruthy();
    expect(component.user?.id).toBe(7);
  });

  it("delete should delete account, logout and navigate to /", () => {
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    component.delete();

    expect(userServiceMock.delete).toHaveBeenCalledWith("7");
    expect(snackMock.open).toHaveBeenCalledWith("Your account has been deleted !", "Close", { duration: 3000 });
    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/"]);
  });

  it("back should call window.history.back", () => {
    const backSpy = jest.spyOn(window.history, "back").mockImplementation(() => {});
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    component.back();
    expect(backSpy).toHaveBeenCalled();

    backSpy.mockRestore();
  });
});
