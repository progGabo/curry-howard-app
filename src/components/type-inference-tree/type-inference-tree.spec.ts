import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeInferenceTree } from './type-inference-tree';

describe('TypeInferenceTree', () => {
  let component: TypeInferenceTree;
  let fixture: ComponentFixture<TypeInferenceTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeInferenceTree ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeInferenceTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
