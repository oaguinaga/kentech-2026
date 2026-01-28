import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Polyfill HTMLDialogElement.showModal() for jsdom (not fully implemented)
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.style.display = 'block';
  };

  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.style.display = 'none';
  };
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})

