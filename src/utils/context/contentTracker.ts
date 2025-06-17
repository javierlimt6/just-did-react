// contentTracker.ts - Content script for in-page activity monitoring

import type { FormEvent } from '../../types';

export class ContentTracker {
  private isListening = false;

  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Monitor form submissions and interactions
    document.addEventListener('submit', this.handleFormSubmit, true);
    document.addEventListener('focusin', this.handleFormFocus, true);

    // Monitor single-page app navigation
    this.observeUrlChanges();
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    document.removeEventListener('submit', this.handleFormSubmit, true);
    document.removeEventListener('focusin', this.handleFormFocus, true);
  }

  private handleFormSubmit = (event: Event): void => {
    const form = event.target as HTMLFormElement;
    if (!form || form.tagName !== 'FORM') return;

    const formData: Record<string, string> = {};
    const formDataObj = new FormData(form);

    // Only capture non-sensitive form data (avoid passwords, emails)
    formDataObj.forEach((value, key) => {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input && !this.isSensitiveField(input)) {
        formData[key] = value.toString().substring(0, 100); // Limit length
      }
    });

    const formEvent: FormEvent = {
      url: window.location.href,
      timestamp: Date.now(),
      type: 'submit',
      formData: Object.keys(formData).length > 0 ? formData : undefined,
    };

    this.sendToBackground('addFormEvent', formEvent);
  };

  private handleFormFocus = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target || !this.isFormField(target)) return;

    const formEvent: FormEvent = {
      url: window.location.href,
      timestamp: Date.now(),
      type: 'focus',
    };

    this.sendToBackground('addFormEvent', formEvent);
  };

  private observeUrlChanges(): void {
    let currentUrl = window.location.href;

    // Override history methods to detect SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleUrlChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleUrlChange();
    };

    window.addEventListener('popstate', handleUrlChange);

    const handleUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.sendToBackground('addNavigationEvent', {
          url: currentUrl,
          title: document.title,
          timestamp: Date.now(),
        });
      }
    };
  }

  private isSensitiveField(input: HTMLInputElement): boolean {
    const sensitiveTypes = ['password', 'email', 'tel', 'credit-card'];
    const sensitiveNames = ['password', 'email', 'phone', 'credit', 'card', 'ssn', 'social'];

    return sensitiveTypes.includes(input.type.toLowerCase()) ||
           sensitiveNames.some(name => input.name.toLowerCase().includes(name)) ||
           sensitiveNames.some(name => input.id.toLowerCase().includes(name));
  }

  private isFormField(element: HTMLElement): boolean {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return formTags.includes(element.tagName);
  }

  private sendToBackground(action: string, data: any): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action, data }).catch(() => {
        // Ignore errors if background script is not available
      });
    }
  }
}

// Auto-start content tracker when script loads
if (typeof window !== 'undefined') {
  const contentTracker = new ContentTracker();
  contentTracker.start();
}
