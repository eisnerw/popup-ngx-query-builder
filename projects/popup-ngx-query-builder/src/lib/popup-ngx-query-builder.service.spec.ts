import { TestBed } from '@angular/core/testing';

import { PopupNgxQueryBuilderService } from './popup-ngx-query-builder.service';

describe('PopupNgxQueryBuilderService', () => {
  let service: PopupNgxQueryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupNgxQueryBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
