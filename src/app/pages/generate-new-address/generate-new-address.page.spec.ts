import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateNewAddressPage } from './generate-new-address.page';

describe('GenerateNewAddressPage', () => {
  let component: GenerateNewAddressPage;
  let fixture: ComponentFixture<GenerateNewAddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateNewAddressPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateNewAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
