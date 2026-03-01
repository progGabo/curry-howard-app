import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTranslations } from '../../services/i18n.service';

interface HelpListItem {
  label?: string;
  text: string;
  children?: HelpListItem[];
}

interface HelpSection {
  title: string;
  paragraph?: string;
  ordered?: boolean;
  items?: HelpListItem[];
}

const HELP_CONTENT: Record<'sk' | 'en', HelpSection[]> = {
  sk: [
    {
      title: 'Úvod',
      paragraph: 'Táto aplikácia demonštruje Curry-Howardov izomorfizmus, ktorý spája logiku a typy v programovaní. Môžete prevádzať medzi logickými výrazmi a lambda výrazmi.'
    },
    {
      title: 'Dva režimy prevodu',
      items: [
        {
          label: 'Výraz → Lambda:',
          text: 'Zadajte logický výraz a aplikácia vygeneruje zodpovedajúci lambda výraz a dôkazový strom.'
        },
        {
          label: 'Lambda → Výraz:',
          text: 'Zadajte lambda výraz a aplikácia určí jeho typ.'
        }
      ]
    },
    {
      title: 'Použitie aplikácie',
      ordered: true,
      items: [
        {
          label: 'Vyberte režim:',
          text: 'Použite tlačidlá "Výraz → Lambda" alebo "Lambda → Výraz" v hlavičke.'
        },
        {
          label: 'Zadajte výraz:',
          text: 'Napíšte logický výraz alebo lambda výraz do editora vľavo.'
        },
        {
          label: 'Príklady:',
          text: 'Môžete použiť rozbaľovací zoznam príkladov na rýchle testovanie.'
        },
        {
          label: 'Generovanie:',
          text: 'Kliknite na tlačidlo "Generuj dôkaz" alebo "Konvertuj lambda".'
        },
        {
          label: 'Výsledok:',
          text: 'V pravej časti sa zobrazí dôkazový strom alebo typ výrazu.'
        }
      ]
    },
    {
      title: 'Režimy práce',
      items: [
        {
          label: 'Auto mód:',
          text: 'Aplikácia automaticky vygeneruje celý dôkaz.'
        },
        {
          label: 'Interaktívny mód:',
          text: 'Môžete manuálne aplikovať pravidlá:',
          children: [
            {
              label: 'Iba použiteľné:',
              text: 'Zobrazí len pravidlá, ktoré možno aplikovať.'
            },
            {
              label: 'Všetky pravidlá:',
              text: 'Zobrazí všetky dostupné pravidlá.'
            },
            {
              label: 'Predpovedať ďalší:',
              text: 'Môžete predpovedať nasledujúce kroky.'
            }
          ]
        }
      ]
    },
    {
      title: 'Práca s dôkazovým stromom',
      items: [
        {
          text: 'Kliknite na uzol v strome pre výber.'
        },
        {
          text: 'Kliknite na tlačidlo "+" pri uzle pre zobrazenie dostupných pravidiel.'
        },
        {
          text: 'V interaktívnom režime môžete použiť tlačidlo "Krok späť" pre vrátenie sa.'
        }
      ]
    },
    {
      title: 'Syntax výrazov',
      items: [
        {
          label: 'Konjunkcia:',
          text: '&&'
        },
        {
          label: 'Disjunkcia:',
          text: '||'
        },
        {
          label: 'Implikácia:',
          text: '=>'
        },
        {
          label: 'Negácia:',
          text: '!'
        },
        {
          label: 'Univerzálny kvantifikátor:',
          text: 'forall'
        },
        {
          label: 'Existenčný kvantifikátor:',
          text: 'exists'
        },
        {
          label: 'Turnstile (sekvent):',
          text: '|-'
        },
        {
          label: 'Lambda abstrakcia:',
          text: '\\'
        }
      ]
    }
  ],
  en: [
    {
      title: 'Introduction',
      paragraph: 'This application demonstrates the Curry-Howard isomorphism, which connects logic and types in programming. You can convert between logical expressions and lambda expressions.'
    },
    {
      title: 'Two conversion modes',
      items: [
        {
          label: 'Expression → Lambda:',
          text: 'Enter a logical expression and the app will generate the corresponding lambda expression and proof tree.'
        },
        {
          label: 'Lambda → Expression:',
          text: 'Enter a lambda expression and the app will determine its type.'
        }
      ]
    },
    {
      title: 'How to use',
      ordered: true,
      items: [
        {
          label: 'Select mode:',
          text: 'Use the "Expression → Lambda" or "Lambda → Expression" buttons in the header.'
        },
        {
          label: 'Enter expression:',
          text: 'Type a logical or lambda expression into the editor on the left.'
        },
        {
          label: 'Examples:',
          text: 'You can use the dropdown list of examples for quick testing.'
        },
        {
          label: 'Generate:',
          text: 'Click the "Generate proof" or "Convert lambda" button.'
        },
        {
          label: 'Result:',
          text: 'The proof tree or expression type will be displayed on the right side.'
        }
      ]
    },
    {
      title: 'Work modes',
      items: [
        {
          label: 'Auto mode:',
          text: 'The app automatically generates the entire proof.'
        },
        {
          label: 'Interactive mode:',
          text: 'You can manually apply rules:',
          children: [
            {
              label: 'Applicable only:',
              text: 'Shows only rules that can be applied.'
            },
            {
              label: 'All rules:',
              text: 'Shows all available rules.'
            },
            {
              label: 'Predict next:',
              text: 'You can predict the next steps.'
            }
          ]
        }
      ]
    },
    {
      title: 'Working with proof tree',
      items: [
        {
          text: 'Click on a node in the tree to select it.'
        },
        {
          text: 'Click the "+" button next to a node to show available rules.'
        },
        {
          text: 'In interactive mode, you can use the "Step Back" button to go back.'
        }
      ]
    },
    {
      title: 'Expression syntax',
      items: [
        {
          label: 'Conjunction:',
          text: '&&'
        },
        {
          label: 'Disjunction:',
          text: '||'
        },
        {
          label: 'Implication:',
          text: '=>'
        },
        {
          label: 'Negation:',
          text: '!'
        },
        {
          label: 'Universal quantifier:',
          text: 'forall'
        },
        {
          label: 'Existential quantifier:',
          text: 'exists'
        },
        {
          label: 'Turnstile (sequent):',
          text: '|-'
        },
        {
          label: 'Lambda abstraction:',
          text: '\\'
        }
      ]
    }
  ]
};

@Component({
  selector: 'app-help-modal',
  standalone: false,
  templateUrl: './help-modal.html',
  styleUrl: './help-modal.scss'
})
export class HelpModalComponent {
  @Input() visible = false;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Input() t!: AppTranslations;

  @Output() close = new EventEmitter<void>();

  get sections(): HelpSection[] {
    return HELP_CONTENT[this.currentLanguage];
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }
}
