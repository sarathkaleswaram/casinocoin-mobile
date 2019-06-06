import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsTabPage } from './accounts-tab.page';

describe('AccountsTabPage', () => {
  let component: AccountsTabPage;
  let fixture: ComponentFixture<AccountsTabPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountsTabPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
