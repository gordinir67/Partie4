import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';

describe('ListComponent (integration)', () => {
  const sessionApiMock = {
    all: jest.fn(),
  };

  function makeSessionService(admin: boolean) {
    return {
      sessionInformation: { id: 1, admin, token: 't', username: 'u' },
    } as any;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    sessionApiMock.all.mockReturnValue(
      of([
        { id: 1, name: 'S1', date: '2026-01-01', teacher_id: 1, description: 'D1', users: [] },
        { id: 2, name: 'S2', date: '2026-01-02', teacher_id: 2, description: 'D2', users: [] },
      ] as any)
    );
  });

  it('should show Create and Edit buttons for admin', async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: makeSessionService(true) },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createBtn).toBeTruthy();

    // On a 2 sessions => 2 boutons detail, et 2 boutons edit (admin)
    const editBtns = fixture.debugElement.queryAll(By.css('button[ng-reflect-router-link^="update"]'));
    expect(editBtns.length).toBe(2);
  });

  it('should hide Create and Edit buttons for non-admin', async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: SessionApiService, useValue: sessionApiMock },
        { provide: SessionService, useValue: makeSessionService(false) },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createBtn).toBeNull();

    const editBtns = fixture.debugElement.queryAll(By.css('button[ng-reflect-router-link^="update"]'));
    expect(editBtns.length).toBe(0);
  });
});
