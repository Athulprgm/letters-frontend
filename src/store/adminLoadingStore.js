import { create } from 'zustand';

export const useAdminLoadingStore = create((set, get) => ({
  isLoading: false,
  message: 'Processing request...',
  subMessage: 'Please wait while changes are synchronized.',
  status: 'loading', // 'loading' | 'success' | 'error'

  startLoading: (message = 'Processing...', subMessage = 'Synchronizing with database...') => {
    set({
      isLoading: true,
      message,
      subMessage,
      status: 'loading',
    });
  },

  stopLoading: (successMessage = null, durationMs = 600) => {
    if (successMessage) {
      set({
        message: successMessage,
        subMessage: 'Completed successfully',
        status: 'success',
      });
      setTimeout(() => {
        set({ isLoading: false, status: 'loading' });
      }, durationMs);
    } else {
      set({ isLoading: false, status: 'loading' });
    }
  },

  showError: (errorMessage = 'Operation failed', durationMs = 2500) => {
    set({
      message: errorMessage,
      subMessage: 'An error occurred during the request.',
      status: 'error',
    });
    setTimeout(() => {
      set({ isLoading: false, status: 'loading' });
    }, durationMs);
  },

  /**
   * Helper wrapper to automatically manage loading screen around any async action.
   */
  withLoading: async (asyncFn, loadingMsg = 'Saving changes...', subMsg = 'Updating store database...', successMsg = 'Saved successfully!') => {
    get().startLoading(loadingMsg, subMsg);
    try {
      const result = await asyncFn();
      get().stopLoading(successMsg, 700);
      return result;
    } catch (error) {
      console.error('Admin action error:', error);
      get().showError(error?.message || 'Operation failed. Please try again.');
      throw error;
    }
  },
}));

export const adminLoading = {
  start: (msg, sub) => useAdminLoadingStore.getState().startLoading(msg, sub),
  stop: (successMsg, dur) => useAdminLoadingStore.getState().stopLoading(successMsg, dur),
  error: (err, dur) => useAdminLoadingStore.getState().showError(err, dur),
  wrap: (fn, msg, sub, success) => useAdminLoadingStore.getState().withLoading(fn, msg, sub, success),
};
