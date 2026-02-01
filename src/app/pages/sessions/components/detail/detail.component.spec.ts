import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { expect } from "@jest/globals";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

import { DetailComponent } from "./detail.component";
import { SessionApiService } from "../../../../core/service/session-api.service";
import { SessionService } from "../../../../core/service/session.service";
import { TeacherService } from "../../../../core/service/teacher.service";

describe("DetailComponent (integration)", () => {
  const routerMock = { navigate: jest.fn() } as unknown as Router;
  const snackMock = { open: jest.fn() } as unknown as MatSnackBar;

  const routeMock = {
    snapshot: { paramMap: { get: (_: string) => "10" } },
  } as unknown as ActivatedRoute;

  const sessionServiceMock = {
    sessionInformation: { id: 1, admin: true, token: "t", username: "u" },
  } as unknown as SessionService;

  const sessionApiMock = {
    detail: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  } as unknown as SessionApiService;

  const teacherServiceMock = {
    detail: jest.fn(),
    all: jest.fn(),
  } as unknown as TeacherService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (teacherServiceMock.detail as jest.Mock).mockReturnValue(of({ id: 99, firstName: "T", lastName: "L" }));
    (sessionApiMock.delete as jest.Mock).mockReturnValue(of(void 0));
    (sessionApiMock.participate as jest.Mock).mockReturnValue(of(void 0));
    (sessionApiMock.unParticipate as jest.Mock).mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [1], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("ngOnInit should fetch session and set isParticipate = true when user is in session.users", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [1, 2], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit -> fetchSession

    expect(sessionApiMock.detail).toHaveBeenCalledWith("10");
    expect(teacherServiceMock.detail).toHaveBeenCalledWith("99");
    expect(component.isParticipate).toBe(true);
    expect(component.teacher).toBeTruthy();
  });

  it("ngOnInit should set isParticipate = false when user is NOT in session.users", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [2, 3], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.isParticipate).toBe(false);
  });

  it("delete should call api, show snackbar and navigate to sessions", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.delete();

    expect(sessionApiMock.delete).toHaveBeenCalledWith("10");
    expect(snackMock.open).toHaveBeenCalledWith("Session deleted !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  });

  it("participate should call api and re-fetch session", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const fetchSpy = jest.spyOn(component as any, "fetchSession");

    component.participate();

    expect(sessionApiMock.participate).toHaveBeenCalledWith("10", "1");
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("unParticipate should call api and re-fetch session", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [1], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const fetchSpy = jest.spyOn(component as any, "fetchSession");

    component.unParticipate();

    expect(sessionApiMock.unParticipate).toHaveBeenCalledWith("10", "1");
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("back should call window.history.back", () => {
    (sessionApiMock.detail as jest.Mock).mockReturnValue(
      of({ id: 10, teacher_id: 99, users: [], name: "S", date: "2026-01-01", description: "D" } as any)
    );

    const backSpy = jest.spyOn(window.history, "back").mockImplementation(() => {});
    const fixture = TestBed.createComponent(DetailComponent);
    const component = fixture.componentInstance;

    component.back();
    expect(backSpy).toHaveBeenCalled();

    backSpy.mockRestore();
  });
});
