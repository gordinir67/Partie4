import { expect } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { ListComponent } from "./list.component";
import { SessionApiService } from "../../../../core/service/session-api.service";
import { SessionService } from "../../../../core/service/session.service";

describe("ListComponent (integration)", () => {
  const sessionApiMock = {
    all: jest.fn(),
  };

  const activatedRouteMock = {
    snapshot: { paramMap: { get: (_: string) => null } },
  } as unknown as ActivatedRoute;

  function makeSessionService(admin: boolean) {
    return {
      sessionInformation: { id: 1, admin, token: "t", username: "u" },
    } as any;
  }

  beforeEach(() => {
    jest.clearAllMocks();

    sessionApiMock.all.mockReturnValue(
      of([
        { id: 1, name: "S1", date: "2026-01-01", teacher_id: 1, description: "D1", users: [] },
        { id: 2, name: "S2", date: "2026-01-02", teacher_id: 2, description: "D2", users: [] },
      ] as any)
    );
  });

  it("should show Create and Edit buttons for admin", async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: makeSessionService(true) },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createBtn).toBeTruthy();

    const editBtns = fixture.debugElement.queryAll(By.css('button[ng-reflect-router-link^="update"]'));
    expect(editBtns.length).toBe(2);
  });

  it("should hide Create and Edit buttons for non-admin", async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: makeSessionService(false) },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createBtn).toBeNull();

    const editBtns = fixture.debugElement.queryAll(By.css('button[ng-reflect-router-link^="update"]'));
    expect(editBtns.length).toBe(0);
  });

  it("should display the sessions list and show Detail button", async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: makeSessionService(false) },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll("mat-card.item");
    expect(items.length).toBe(2);

    expect(fixture.nativeElement.textContent).toContain("S1");
    expect(fixture.nativeElement.textContent).toContain("S2");

    const allButtons = Array.from(fixture.nativeElement.querySelectorAll("button")) as HTMLButtonElement[];
    const detailButtons = allButtons.filter((b) => (b.textContent || "").includes("Detail"));
    expect(detailButtons.length).toBe(2);
  });
});