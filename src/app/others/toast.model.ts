export interface ToastConfig {
  header?: string;
  message: string;
  color?: 'success' | 'danger' | 'info' | 'warning';
  delay?: number;
  position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
}
