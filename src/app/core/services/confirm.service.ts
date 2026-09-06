import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

export interface ConfirmState extends ConfirmRequest {
  visible: boolean;
}

const DEFAULT_STATE: ConfirmState = {
  visible: false,
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
};

/**
 * Lightweight promise-based confirm dialog service. Call `confirm()` from
 * anywhere in the app and `await` the result — the globally-mounted
 * <app-confirm-dialog> in AppComponent renders the UI and resolves it.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private stateSubject = new BehaviorSubject<ConfirmState>(DEFAULT_STATE);
  readonly state$ = this.stateSubject.asObservable();

  private resolver?: (value: boolean) => void;

  confirm(options: Partial<ConfirmRequest> & { message: string }): Promise<boolean> {
    this.stateSubject.next({
      ...DEFAULT_STATE,
      ...options,
      visible: true,
    });
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  respond(result: boolean): void {
    this.stateSubject.next({ ...this.stateSubject.value, visible: false });
    this.resolver?.(result);
    this.resolver = undefined;
  }
}
