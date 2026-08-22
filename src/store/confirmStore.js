import { create } from 'zustand';

export const useConfirmStore = create((set, get) => ({
  isOpen: false,
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'danger', // 'danger' | 'warning' | 'info' | 'success'
  _resolve: null,

  confirm: ({
    title = 'Are you sure?',
    message = 'Please confirm this action.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
  } = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        _resolve: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { _resolve } = get();
    if (_resolve) _resolve(true);
    set({ isOpen: false, _resolve: null });
  },

  handleCancel: () => {
    const { _resolve } = get();
    if (_resolve) _resolve(false);
    set({ isOpen: false, _resolve: null });
  },
}));

// Direct helper function to call confirm dialog from anywhere
export const confirmDialog = (options) => {
  return useConfirmStore.getState().confirm(options);
};
