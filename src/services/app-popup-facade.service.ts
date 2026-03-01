import { Injectable } from '@angular/core';
import { DerivationNode } from '../models/formula-node';
import { NdNode } from '../models/nd-node';
import { TypeInferenceNode } from './type-inference-service';

export type PopupNode = DerivationNode | NdNode | TypeInferenceNode;

@Injectable({ providedIn: 'root' })
export class AppPopupFacadeService {
  visible = false;
  x = 0;
  y = 0;
  node: PopupNode | null = null;

  open(node: PopupNode, x: number, y: number): void {
    this.node = node;
    this.x = x;
    this.y = y;
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.node = null;
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
