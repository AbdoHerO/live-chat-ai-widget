import { TestBed } from '@angular/core/testing';

import { MessageStorageService } from './message-storage.service';

describe('MessageStorageService', () => {
  let service: MessageStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
