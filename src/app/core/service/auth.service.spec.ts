import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { expect } from '@jest/globals';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('register should POST /api/auth/register', () => {
    service.register({ email: 'a@a.com', firstName: 'A', lastName: 'B', password: '123' } as any).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('login should POST /api/auth/login and return session info', () => {
    const mockSession = { id: 1, admin: false, token: 't', username: 'u' } as any;

    service.login({ email: 'a@a.com', password: '123' } as any).subscribe((res) => {
      expect(res).toEqual(mockSession);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockSession);
  });
});
