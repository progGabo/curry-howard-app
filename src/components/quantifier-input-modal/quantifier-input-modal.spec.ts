import { QuantifierInputModalComponent } from './quantifier-input-modal';
import { I18nService } from '../../services/i18n.service';

describe('QuantifierInputModalComponent', () => {
  function createComponent(configData: any): QuantifierInputModalComponent {
    const ref = {
      close: jasmine.createSpy('close')
    } as any;
    const config = {
      data: configData
    } as any;
    const i18n = new I18nService();

    const component = new QuantifierInputModalComponent(ref, config, i18n);
    component.ngOnInit();
    return component;
  }

  it('uses ND intro labels for forall in English', () => {
    const component = createComponent({
      ruleType: 'forall-intro',
      language: 'en',
      freeVars: []
    });

    expect(component.title).toContain('∀I');
    expect(component.isVariableInput).toBeTrue();
    expect(component.labelVariable).toBe('Variable');
  });

  it('shows not-fresh error in Slovak for eigenvariable input', () => {
    const component = createComponent({
      ruleType: 'exists-elim',
      language: 'sk',
      freeVars: ['x']
    });

    component.inputValue = 'x';
    const valid = component.validate();

    expect(valid).toBeFalse();
    expect(component.errorMessage).toContain('Premenná x už bola použitá');
  });

  it('shows translated empty-term error for elimination/instantiation term input', () => {
    const component = createComponent({
      ruleType: 'forall-elim',
      language: 'en'
    });

    component.inputValue = '   ';
    const valid = component.validate();

    expect(valid).toBeFalse();
    expect(component.errorMessage).toBe('Field cannot be empty.');
  });
});
