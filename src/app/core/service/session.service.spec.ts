import { expect } from '@jest/globals';

import { SessionService } from './session.service';

describe('SessionService (unit)', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  it('should start logged out', (done) => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();

    service.$isLogged().subscribe((v) => {
      expect(v).toBe(false);
      done();
    });
  });

  it('logIn should set sessionInformation and emit true', (done) => {
    const user = { id: 1, admin: true, token: 't', username: 'u' } as any;

    const values: boolean[] = [];
    const sub = service.$isLogged().subscribe((v) => values.push(v));

    service.logIn(user);

    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toEqual(user);

    // values: [false, true]
    expect(values).toContain(true);

    sub.unsubscribe();
    done();
  });

  it('logOut should clear sessionInformation and emit false', () => {
    const user = { id: 1, admin: false, token: 't', username: 'u' } as any;
    service.logIn(user);

    expect(service.isLogged).toBe(true);

    service.logOut();

    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });
});
