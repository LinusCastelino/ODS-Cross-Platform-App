import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstLoadPage } from './first-load.page';

describe('FirstLoadPage', () => {
  let component: FirstLoadPage;
  let fixture: ComponentFixture<FirstLoadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstLoadPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstLoadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
