import { expect } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import { LoginComponent } from "./login.component";
import { AuthService } from "../../core/service/auth.service";
import { SessionService } from "src/app/core/service/session.service";

describe("LoginComponent (integration)", () => {
  const routerMock = { navigate: jest.fn(), url: "/login" } as unknown as Router;

  const authServiceMock = {
    login: jest.fn(),
  };

  const sessionServiceMock = {
    logIn: jest.fn(),
  } as unknown as SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();
  });

  it("should login and navigate to /sessions on success", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    authServiceMock.login.mockReturnValue(of({ id: 1, admin: false, token: "t", username: "u" }));

    component.form.setValue({ email: "a@a.com", password: "123" });
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalled();
    expect(sessionServiceMock.logIn).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/sessions"]);
    expect(component.onError).toBe(false);
  });

  it("should set onError=true on login error", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    authServiceMock.login.mockReturnValue(throwError(() => new Error("bad credentials")));

    component.form.setValue({ email: "a@a.com", password: "123" });
    component.submit();

    expect(component.onError).toBe(true);
    expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalledWith(["/sessions"]);
  });

  it("should disable submit button when a required field is missing (and not call login)", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    // Form invalide (email/password vides)
    expect(component.form.invalid).toBe(true);

    const submitBtn: HTMLButtonElement = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitBtn.disabled).toBe(true);

    // Même si on clique, aucun appel login (car bouton disabled)
    submitBtn.click();
    expect(authServiceMock.login).not.toHaveBeenCalled();

    // Et aucun message d'erreur (onError est uniquement set sur erreur API)
    expect(component.onError).toBe(false);
  });
});