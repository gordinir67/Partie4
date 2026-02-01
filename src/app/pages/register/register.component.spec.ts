import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';
import { expect } from '@jest/globals';

describe('RegisterComponent (integration)', () => {
  const routerMock = { navigate: jest.fn(), url: '/register' } as unknown as Router;

  const authServiceMock = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  it('should register and navigate to /login on success', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    authServiceMock.register.mockReturnValue(of(void 0));

    component.form.setValue({
      email: 'a@a.com',
      firstName: 'John',
      lastName: 'Doe',
      password: '123',
    });

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should set onError=true on register error', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    authServiceMock.register.mockReturnValue(throwError(() => new Error('error')));

    component.form.setValue({
      email: 'a@a.com',
      firstName: 'John',
      lastName: 'Doe',
      password: '123',
    });

    component.submit();

    expect(component.onError).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/login']);
  });
});
