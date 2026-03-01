import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ProofTree } from './proof-tree';
import { I18nService } from '../../services/i18n.service';
import { NotificationService } from '../../services/notification.service';

describe('ProofTree', () => {
  let component: ProofTree;
  let fixture: ComponentFixture<ProofTree>;
  const notificationMock = {
    showError: jasmine.createSpy('showError')
  };
  const i18nMock = {
    t: jasmine.createSpy('t').and.returnValue({}),
    translate: jasmine.createSpy('translate').and.returnValue('err'),
    errorSummary: jasmine.createSpy('errorSummary').and.returnValue('Error')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProofTree],
      providers: [
        { provide: NotificationService, useValue: notificationMock },
        { provide: I18nService, useValue: i18nMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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
