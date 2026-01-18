import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofTree } from './proof-tree';

describe('ProofTree', () => {
  let component: ProofTree;
  let fixture: ComponentFixture<ProofTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
