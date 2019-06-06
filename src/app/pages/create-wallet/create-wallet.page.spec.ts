import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWalletPage } from './create-wallet.page';

describe('CreateWalletPage', () => {
  let component: CreateWalletPage;
  let fixture: ComponentFixture<CreateWalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateWalletPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
