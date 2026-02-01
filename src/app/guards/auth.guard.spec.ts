import { AuthGuard } from './auth.guard';
import { expect } from '@jest/globals';

describe('AuthGuard (unit)', () => {
  it('should block navigation and redirect to login when not logged', () => {
    const router = { navigate: jest.fn() } as any;
    const sessionService = { isLogged: false } as any;

    const guard = new AuthGuard(router, sessionService);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should allow navigation when logged', () => {
    const router = { navigate: jest.fn() } as any;
    const sessionService = { isLogged: true } as any;

    const guard = new AuthGuard(router, sessionService);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
