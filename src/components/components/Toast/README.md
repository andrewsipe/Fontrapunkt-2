# Toasts

This app uses **[react-hot-toast](https://react-hot-toast.com/)** for notifications.

- `Toaster` is rendered in `AppProviders.tsx`.
- Use `import toast from "react-hot-toast"` and call `toast("message")`, `toast.success()`, `toast.error()`, or `toast(<JSX />)`.
- For styled content, use the `shared.standardToast` class (see `src/styles/shared.module.css`) as the wrapper—e.g. in ExportButtons, EmptyState, ScreenshotPreviewModal.
