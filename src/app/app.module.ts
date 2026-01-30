import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { App } from './app';
import { RouterOutlet } from '@angular/router';
import { ProofTree } from '../components/proof-tree/proof-tree';
import { Editor } from '../components/editor/editor';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { ProofLambda } from '../components/proof-lambda/proof-lambda';
import { TypeInferenceTree } from '../components/type-inference-tree/type-inference-tree';
import { QuantifierInputModalComponent } from '../components/quantifier-input-modal/quantifier-input-modal';
import { TreeCanvasComponent } from '../components/tree-canvas/tree-canvas';
import { RuleMenuPopupComponent } from '../components/rule-menu-popup/rule-menu-popup';
import { HelpModalComponent } from '../components/help-modal/help-modal';
import { AppHeaderComponent } from '../components/app-header/app-header';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import { I18nService } from '../services/i18n.service';

@NgModule({
  declarations: [
    App,
    ProofTree,
    Editor,
    ProofLambda,
    TypeInferenceTree,
    QuantifierInputModalComponent,
    TreeCanvasComponent,
    RuleMenuPopupComponent,
    HelpModalComponent,
    AppHeaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterOutlet,
    FormsModule,
    MonacoEditorModule.forRoot(),
    ButtonModule,
    SplitterModule,
    ToastModule,
    DialogModule,
    DynamicDialogModule
  ],
  providers: [
    I18nService,
    provideMonacoEditor({
      baseUrl: './assets/monaco',
      defaultOptions: { scrollBeyondLastLine: false }
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Material
      }
    }),
    MessageService,
    DialogService
  ],
  bootstrap: [App]
})
export class AppModule {}