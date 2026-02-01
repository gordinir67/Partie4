import { UnauthGuard } from './unauth.guard';
import { expect } from '@jest/globals';

describe('UnauthGuard (unit)', () => {
  it('should block navigation and redirect to rentals when already logged', () => {
    const router = { navigate: jest.fn() } as any;
    const sessionService = { isLogged: true } as any;

    const guard = new UnauthGuard(router, sessionService);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['rentals']);
  });

  it('should allow navigation when not logged', () => {
    const router = { navigate: jest.fn() } as any;
    const sessionService = { isLogged: false } as any;

    const guard = new UnauthGuard(router, sessionService);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
