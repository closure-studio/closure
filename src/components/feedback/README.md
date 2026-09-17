# Feedback Components

Shared loading, empty, error, toast, and progress feedback belongs here once it is reused across features. Feature-specific feedback remains inside that feature.

`AppToastHost` owns the application-wide presentation for `@tamagui/toast/v2`. Screens and owning feature hooks may publish short, non-blocking feedback through the library singleton. Presentational components receive callbacks instead, and persistent errors or recovery instructions remain inline.

Feature code should prefer `toast.info`, `toast.success`, `toast.warning`, and `toast.error`, with a title and optional description. `AppToastHost` renders any other valid library type—including default and loading toasts—with the info presentation, so unsupported tones never fail silently.

Visual styling, dimensions, animation timing, and opacity values are implementation details owned by the toast components and their constants. The host passes shared width and lifecycle timing into its backdrop so those coupled values have one source of truth. Keep the values themselves out of this document.
