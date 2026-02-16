// TODO: remove this once Appuniversum ships Toaster types.
// WIP PR: https://github.com/appuniversum/ember-appuniversum/pull/490

import Service from '@ember/service';
import type { ComponentLike } from '@glint/template';

export type ToastData = {
  component?: ComponentLike<CustomToastSignature>;
  title?: string;
  message?: string;
  options: ToastOptions | CustomToastOptions;
};

interface BaseOptions {
  icon?:
    | string
    | ComponentLike<{
        Element: Element;
      }>;
  closable?: boolean;
  timeOut?: number | null;
}
export interface ToastOptions extends BaseOptions {
  type?: 'error' | 'success' | 'warning';
}
export interface CustomToastOptions extends BaseOptions {
  [key: string]: unknown;
}

export interface CustomToastSignature {
  Args: {
    options: ToastOptions | CustomToastOptions;
    close: () => void;
  };
}

export default class ToasterService extends Service {
  show(
    component: ComponentLike<CustomToastSignature>,
    options?: Record<string, unknown>,
  ): {
    component: ComponentLike<CustomToastSignature>;
    options: Record<string, unknown>;
  };

  notify(
    message: string,
    title: string,
    options?: ToastOptions,
  ): {
    title: string;
    message: string;
    options: ToastOptions;
  };

  success(
    message: string,
    title: string,
    options?: ToastOptions,
  ): {
    title: string;
    message: string;
    options: ToastOptions;
  };

  warning(
    message: string,
    title: string,
    options?: ToastOptions,
  ): {
    title: string;
    message: string;
    options: ToastOptions;
  };

  error(
    message?: string,
    title?: string,
    options?: ToastOptions,
  ): {
    title: string | undefined;
    message: string | undefined;
    options: ToastOptions;
  };

  loading(
    message?: string,
    title?: string,
    options?: ToastOptions,
  ): {
    title: string | undefined;
    message: string | undefined;
    options: ToastOptions;
  };

  close(toast: ToastData): void;
}
