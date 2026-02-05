import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SessionApiService } from './session-api.service';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('all() should GET api/session', () => {
    service.all().subscribe();

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('detail() should GET api/session/:id', () => {
    service.detail('10').subscribe();

    const req = httpMock.expectOne('api/session/10');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 10 });
  });

  it('delete() should DELETE api/session/:id', () => {
    service.delete('10').subscribe();

    const req = httpMock.expectOne('api/session/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('create() should POST api/session', () => {
    service.create({} as any).subscribe();

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('update() should PUT api/session/:id', () => {
    service.update('10', {} as any).subscribe();

    const req = httpMock.expectOne('api/session/10');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('participate() should POST api/session/:id/participate/:userId', () => {
    service.participate('10', '7').subscribe();

    const req = httpMock.expectOne('api/session/10/participate/7');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(null);
  });

  it('unParticipate() should DELETE api/session/:id/participate/:userId', () => {
    service.unParticipate('10', '7').subscribe();

    const req = httpMock.expectOne('api/session/10/participate/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});