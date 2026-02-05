import { expect } from "@jest/globals";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { FormComponent } from "./form.component";
import { SessionApiService } from "../../../../core/service/session-api.service";
import { SessionService } from "../../../../core/service/session.service";
import { TeacherService } from "../../../../core/service/teacher.service";

describe("FormComponent (integration)", () => {
  const routerMock = { navigate: jest.fn(), url: "/sessions/create" } as any;

  const routeMock = {
    snapshot: { paramMap: { get: () => "10" } },
  } as unknown as ActivatedRoute;

  const snackMock = { open: jest.fn() } as unknown as MatSnackBar;

  const sessionServiceMock = {
    sessionInformation: { id: 1, admin: true, token: "t", username: "u" },
  } as unknown as SessionService;

  const sessionApiMock = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any;

  const teacherServiceMock = {
    all: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    teacherServiceMock.all.mockReturnValue(of([]));
    sessionApiMock.create.mockReturnValue(of(void 0));
    sessionApiMock.update.mockReturnValue(of(void 0));
    sessionApiMock.detail.mockReturnValue(
      of({
        id: 10,
        name: "Session",
        date: "2026-01-15T00:00:00.000Z",
        teacher_id: 2,
        description: "Desc",
        users: [],
      })
    );

    await TestBed.configureTestingModule({
      imports: [FormComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MatSnackBar, useValue: snackMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    }).compileComponents();

    // ✅ Force override même si MaterialModule fournit MatSnackBar
    TestBed.overrideProvider(MatSnackBar, { useValue: snackMock });
    TestBed.overrideProvider(Router, { useValue: routerMock });
  });

  it("should init create form", () => {
    routerMock.url = "/sessions/create";

    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.onUpdate).toBe(false);
  });

  it("should NOT create session when form is invalid (Save disabled)", () => {
    routerMock.url = "/sessions/create";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: "New",
      date: "2026-02-01",
      teacher_id: 1,
      description: "", // required => invalid
    });
    fixture.detectChanges();

    expect(component.sessionForm!.valid).toBe(false);

    const saveBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);

    // Tentative de submit via DOM : ne doit rien déclencher (bouton disabled)
    saveBtn.click();
    expect(sessionApiMock.create).not.toHaveBeenCalled();
  });

  it("should create session when form is valid (submit)", fakeAsync(() => {
    routerMock.url = "/sessions/create";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: "New",
      date: "2026-02-01",
      teacher_id: 1,
      description: "Some description",
    });
    fixture.detectChanges();

    const saveBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);

    // Déclenche ngSubmit de façon fiable
    const form = fixture.nativeElement.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));
    tick();

    expect(sessionApiMock.create).toHaveBeenCalledWith({
      name: "New",
      date: "2026-02-01",
      teacher_id: 1,
      description: "Some description",
    });

    expect(snackMock.open).toHaveBeenCalledWith("Session created !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  }));

  it("should init update form and format date", () => {
    routerMock.url = "/sessions/update/10";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm!.get("date")!.value).toBe("2026-01-15");
  });

  it("should NOT update session when form is invalid (Save disabled)", () => {
    routerMock.url = "/sessions/update/10";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: "", // required => invalid
      date: "2026-02-02",
      teacher_id: 3,
      description: "Updated",
    });
    fixture.detectChanges();

    expect(component.sessionForm!.valid).toBe(false);

    const saveBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);

    saveBtn.click();
    expect(sessionApiMock.update).not.toHaveBeenCalled();
  });

  it("should update session when form is valid (submit)", fakeAsync(() => {
    routerMock.url = "/sessions/update/10";

    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: "Updated name",
      date: "2026-02-02",
      teacher_id: 3,
      description: "Updated description",
    });
    fixture.detectChanges();

    const saveBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);

    const form = fixture.nativeElement.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));
    tick();

    expect(sessionApiMock.update).toHaveBeenCalledWith("10", {
      name: "Updated name",
      date: "2026-02-02",
      teacher_id: 3,
      description: "Updated description",
    });

    expect(snackMock.open).toHaveBeenCalledWith("Session updated !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  }));
});