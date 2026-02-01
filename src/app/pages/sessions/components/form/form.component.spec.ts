import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { expect } from "@jest/globals";
import { MatSnackBar } from "@angular/material/snack-bar";

import { FormComponent } from "./form.component";
import { SessionApiService } from "../../../../core/service/session-api.service";
import { SessionService } from "../../../../core/service/session.service";
import { TeacherService } from "../../../../core/service/teacher.service";

describe("FormComponent (integration)", () => {
  const routerMock = { navigate: jest.fn(), url: "/sessions/create" } as any;

  const routeMock = {
    snapshot: { paramMap: { get: (_: string) => "10" } },
  } as unknown as ActivatedRoute;

  const snackBarMock = { open: jest.fn() } as unknown as MatSnackBar;

  const sessionServiceMock = {
    sessionInformation: { id: 1, admin: true, token: "t", username: "u" },
  } as unknown as SessionService;

  const sessionApiMock = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as SessionApiService;

  const teacherServiceMock = {
    all: jest.fn(),
  } as unknown as TeacherService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (teacherServiceMock.all as jest.Mock).mockReturnValue(of([]));
    (sessionApiMock.create as jest.Mock).mockReturnValue(of(void 0));
    (sessionApiMock.update as jest.Mock).mockReturnValue(of(void 0));
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({
        id: 10,
        name: "Session",
        date: "2026-01-15T00:00:00.000Z",
        teacher_id: 2,
        description: "Desc",
        users: [],
      } as any)
    );

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    }).compileComponents();
  });

  it("should redirect non-admin to /sessions", () => {
    // on bascule admin=false
    (sessionServiceMock as any).sessionInformation = { id: 1, admin: false };

    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges(); // ngOnInit

    expect(routerMock.navigate).toHaveBeenCalledWith(["/sessions"]);
  });

  it("should init create form when url does NOT include update", () => {
    (sessionServiceMock as any).sessionInformation = { id: 1, admin: true };
    routerMock.url = "/sessions/create";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit -> initForm()

    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeTruthy();

    // Validators: required => invalid si vide
    component.sessionForm!.setValue({ name: "", date: "", teacher_id: "", description: "" });
    expect(component.sessionForm!.valid).toBe(false);
  });

  it("submit should create session and exitPage", () => {
    (sessionServiceMock as any).sessionInformation = { id: 1, admin: true };
    routerMock.url = "/sessions/create";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // initForm()

    component.sessionForm!.setValue({
      name: "New",
      date: "2026-02-01",
      teacher_id: 1,
      description: "Ok",
    });

    component.submit();

    expect(sessionApiMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New",
        date: "2026-02-01",
        teacher_id: 1,
        description: "Ok",
      })
    );
    expect(snackBarMock.open).toHaveBeenCalledWith("Session created !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  });

  it("should init update form when url includes update (and format date)", () => {
    (sessionServiceMock as any).sessionInformation = { id: 1, admin: true };
    routerMock.url = "/sessions/update/10";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit -> detail(10) -> initForm(session)

    expect(component.onUpdate).toBe(true);
    expect(sessionApiMock.detail).toHaveBeenCalledWith("10");

    // Date est convertie en YYYY-MM-DD via toISOString().split('T')[0]
    expect(component.sessionForm!.get("date")!.value).toBe("2026-01-15");

    // Max length validator sur description
    component.sessionForm!.patchValue({ description: "a".repeat(2001) });
    expect(component.sessionForm!.valid).toBe(false);
  });

  it("submit should update session and exitPage", () => {
    (sessionServiceMock as any).sessionInformation = { id: 1, admin: true };
    routerMock.url = "/sessions/update/10";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // detail -> initForm(session)

    component.sessionForm!.setValue({
      name: "Updated",
      date: "2026-02-02",
      teacher_id: 3,
      description: "Updated desc",
    });

    component.submit();

    expect(sessionApiMock.update).toHaveBeenCalledWith(
      "10",
      expect.objectContaining({
        name: "Updated",
        date: "2026-02-02",
        teacher_id: 3,
        description: "Updated desc",
      })
    );
    expect(snackBarMock.open).toHaveBeenCalledWith("Session updated !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  });
});
