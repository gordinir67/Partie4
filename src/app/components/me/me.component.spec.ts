import { expect } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of } from "rxjs";

import { MeComponent } from "./me.component";
import { SessionService } from "../../core/service/session.service";
import { UserService } from "../../core/service/user.service";

describe("MeComponent (integration)", () => {
  const routerMock = { navigate: jest.fn() } as unknown as Router;
  const snackMock = { open: jest.fn() } as unknown as MatSnackBar;

  const sessionServiceMock = {
    sessionInformation: { id: 7, admin: false, token: "t", username: "u" },
    logOut: jest.fn(),
  } as unknown as SessionService;

  const userServiceMock = {
    getById: jest.fn().mockReturnValue(of({ id: 7, email: "a@b.com", firstName: "A", lastName: "B" })),
    delete: jest.fn().mockReturnValue(of(void 0)),
  } as unknown as UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MatSnackBar, useValue: snackMock },
      ],
    }).compileComponents();

    // ✅ Force override même si MaterialModule fournit MatSnackBar
    TestBed.overrideProvider(MatSnackBar, { useValue: snackMock });
  });

  it("should fetch user on init", () => {
    const fixture = TestBed.createComponent(MeComponent);
    fixture.detectChanges(); // ngOnInit

    expect(userServiceMock.getById).toHaveBeenCalledWith("7");
    expect(fixture.componentInstance.user).toBeTruthy();
  });

  it("should display user information (name + email)", () => {
    const fixture = TestBed.createComponent(MeComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent || "";

    // lastName | uppercase dans le template
    expect(text).toContain("Name: A B");
    expect(text).toContain("Email: a@b.com");
  });

  it("delete should delete account, logout and navigate to /", () => {
    const fixture = TestBed.createComponent(MeComponent);
    fixture.detectChanges();

    fixture.componentInstance.delete();

    expect(userServiceMock.delete).toHaveBeenCalledWith("7");
    expect(snackMock.open).toHaveBeenCalledWith("Your account has been deleted !", "Close", { duration: 3000 });
    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/"]);
  });
});