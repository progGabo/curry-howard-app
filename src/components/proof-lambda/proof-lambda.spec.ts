import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofLambda } from './proof-lambda';

describe('ProofLambda', () => {
  let component: ProofLambda;
  let fixture: ComponentFixture<ProofLambda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProofLambda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofLambda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
