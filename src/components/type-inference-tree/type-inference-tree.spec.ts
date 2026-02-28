import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TypeInferenceTree } from './type-inference-tree';
import { LambdaParserService } from '../../services/lambda-parser-service';
import { I18nService } from '../../services/i18n.service';
import { NotificationService } from '../../services/notification.service';
import { TypeFactories } from '../../utils/ast-factories';

describe('TypeInferenceTree', () => {
  let component: TypeInferenceTree;
  let fixture: ComponentFixture<TypeInferenceTree>;
  const notificationMock = {
    showError: jasmine.createSpy('showError')
  };
  const i18nMock = {
    translate: jasmine.createSpy('translate').and.returnValue('err'),
    errorSummary: jasmine.createSpy('errorSummary').and.returnValue('Error')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeInferenceTree],
      providers: [
        LambdaParserService,
        { provide: NotificationService, useValue: notificationMock },
        { provide: I18nService, useValue: i18nMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeInferenceTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats Bottom as ⊥ without bracket fallback', () => {
    expect(component.formatType(TypeFactories.bottom())).toBe('⊥');
  });

  it('formats A → ⊥ as ¬A', () => {
    const neg = TypeFactories.func(TypeFactories.typeVar('A'), TypeFactories.bottom());
    expect(component.formatType(neg)).toBe('¬A');
  });

  it('formats contraposition type with compressed negations', () => {
    const t = TypeFactories.func(
      TypeFactories.func(TypeFactories.typeVar('p'), TypeFactories.typeVar('q')),
      TypeFactories.func(
        TypeFactories.func(TypeFactories.typeVar('q'), TypeFactories.bottom()),
        TypeFactories.func(TypeFactories.typeVar('p'), TypeFactories.bottom())
      )
    );

    expect(component.formatType(t)).toBe('(P → Q) → (¬Q → ¬P)');
  });

  it('formats nested negation consistently', () => {
    const t = TypeFactories.func(
      TypeFactories.func(TypeFactories.typeVar('A'), TypeFactories.bottom()),
      TypeFactories.bottom()
    );

    expect(component.formatType(t)).toBe('¬(¬A)');
  });
});
