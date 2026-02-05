import { expect } from "@jest/globals";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of } from "rxjs";

import { DetailComponent } from "./detail.component";
import { SessionApiService } from "../../../../core/service/session-api.service";
import { SessionService } from "../../../../core/service/session.service";
import { TeacherService } from "../../../../core/service/teacher.service";

describe("DetailComponent (integration)", () => {
  let fixture: ComponentFixture<DetailComponent>;
  let component: DetailComponent;

  const sessionApiMock = {
    detail: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  };

  const teacherServiceMock = {
    detail: jest.fn(),
  };

  const sessionServiceMock = {
    sessionInformation: {
      id: 7,
      admin: true,
    },
  };

  const snackMock = {
    open: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue("10"),
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    sessionServiceMock.sessionInformation.admin = true;

    sessionApiMock.detail.mockReturnValue(
      of({
        id: 10,
        name: "Session",
        date: "2026-02-01",
        teacher_id: 1,
        description: "desc",
        users: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-20",
      })
    );

    teacherServiceMock.detail.mockReturnValue(
      of({
        id: 1,
        firstName: "John",
        lastName: "Doe",
      })
    );

    sessionApiMock.delete.mockReturnValue(of({}));
    sessionApiMock.participate.mockReturnValue(of({}));
    sessionApiMock.unParticipate.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MatSnackBar, useValue: snackMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    // ✅ IMPORTANT : force Angular à prendre NOS mocks même si MaterialModule fournit MatSnackBar
    TestBed.overrideProvider(MatSnackBar, { useValue: snackMock });
    TestBed.overrideProvider(Router, { useValue: routerMock });
    TestBed.overrideProvider(ActivatedRoute, { useValue: activatedRouteMock });

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  it("should fetch session on init and compute participate + teacher", () => {
    sessionApiMock.detail.mockReturnValueOnce(
      of({
        id: 10,
        name: "Session",
        date: "2026-02-01",
        teacher_id: 1,
        description: "desc",
        users: [7, 9],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-20",
      })
    );

    fixture.detectChanges();

    expect(sessionApiMock.detail).toHaveBeenCalledWith("10");
    expect(teacherServiceMock.detail).toHaveBeenCalledWith("1");
    expect(component.session?.id).toBe(10);
    expect(component.teacher?.id).toBe(1);
    expect(component.isParticipate).toBe(true);
  });

  it("should set isAdmin from sessionService (admin user)", () => {
    expect(component.isAdmin).toBe(true);
  });

  it("should show delete button when user is admin", () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent || "").toContain("Delete");
  });

  it("should NOT show delete button when user is NOT admin", () => {
    // isAdmin est lu dans le constructor -> il faut créer un NOUVEAU composant
    sessionServiceMock.sessionInformation.admin = false;

    const localFixture = TestBed.createComponent(DetailComponent);
    localFixture.detectChanges();

    const el: HTMLElement = localFixture.nativeElement;
    expect(el.textContent || "").not.toContain("Delete");
  });

  it("should display session information (title, teacher, attendees, description)", () => {
    sessionApiMock.detail.mockReturnValueOnce(
      of({
        id: 10,
        name: "Session",
        date: "2026-02-01",
        teacher_id: 1,
        description: "desc",
        users: [1, 2, 3],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-20",
      })
    );

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent || "";

    // name | titlecase
    expect(text).toContain("Session");

    // teacher lastName | uppercase
    expect(text).toContain("John DOE");

    // users.length + libellé
    expect(text).toContain("3 attendees");

    // description
    expect(text).toContain("Description:");
    expect(text).toContain("desc");
  });

  it("delete should call api, snackbar and navigate", fakeAsync(() => {
    fixture.detectChanges();

    component.delete();
    tick();

    expect(sessionApiMock.delete).toHaveBeenCalledWith("10");
    expect(snackMock.open).toHaveBeenCalledWith("Session deleted !", "Close", { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(["sessions"]);
  }));

  it("participate should call api and refetch session", () => {
    fixture.detectChanges();
    const fetchSpy = jest.spyOn(component as any, "fetchSession");

    component.participate();

    expect(sessionApiMock.participate).toHaveBeenCalledWith("10", "7");
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("unParticipate should call api and refetch session", () => {
    fixture.detectChanges();
    const fetchSpy = jest.spyOn(component as any, "fetchSession");

    component.unParticipate();

    expect(sessionApiMock.unParticipate).toHaveBeenCalledWith("10", "7");
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("back should call window.history.back", () => {
    const backSpy = jest.spyOn(window.history, "back").mockImplementation(() => {});
    component.back();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});