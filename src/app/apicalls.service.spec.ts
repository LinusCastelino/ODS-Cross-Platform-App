import { TestBed } from '@angular/core/testing';

import { APICallsService } from './apicalls.service';

describe('APICallsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: APICallsService = TestBed.get(APICallsService);
    expect(service).toBeTruthy();
  });
});
