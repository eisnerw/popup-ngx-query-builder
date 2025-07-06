import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNgxQueryBuilderComponent } from './popup-ngx-query-builder.component';

describe('PopupNgxQueryBuilderComponent', () => {
  let component: PopupNgxQueryBuilderComponent;
  let fixture: ComponentFixture<PopupNgxQueryBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupNgxQueryBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupNgxQueryBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
