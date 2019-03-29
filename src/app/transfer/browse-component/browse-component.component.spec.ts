import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseComponentComponent } from './browse-component.component';

describe('BrowseComponentComponent', () => {
  let component: BrowseComponentComponent;
  let fixture: ComponentFixture<BrowseComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
