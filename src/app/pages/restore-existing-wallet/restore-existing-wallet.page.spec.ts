import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreExistingWalletPage } from './restore-existing-wallet.page';

describe('RestoreExistingWalletPage', () => {
  let component: RestoreExistingWalletPage;
  let fixture: ComponentFixture<RestoreExistingWalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreExistingWalletPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreExistingWalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
