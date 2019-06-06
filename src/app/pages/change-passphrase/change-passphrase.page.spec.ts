import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePassphrasePage } from './change-passphrase.page';

describe('ChangePassphrasePage', () => {
  let component: ChangePassphrasePage;
  let fixture: ComponentFixture<ChangePassphrasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePassphrasePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePassphrasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
