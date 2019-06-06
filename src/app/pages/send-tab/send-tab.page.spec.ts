import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTabPage } from './send-tab.page';

describe('SendTabPage', () => {
  let component: SendTabPage;
  let fixture: ComponentFixture<SendTabPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SendTabPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
