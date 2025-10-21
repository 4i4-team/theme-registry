# Changelog

## 1.1.10 - 2025-10-21

- Change `useThemeSettings` to accept individual setting keys (e.g. `"palette"`) and merge overrides at that granularity while keeping the overall settings type intact.
- Update documentation to reflect per-setting registration under the `_settings` scope.

## 1.1.9 - 2025-10-21

- Reserve the `_settings` scope within the registry for theme configuration payloads.
- Add `useThemeSettings` hook that merges overrides from the `_settings` scope with theme defaults.
- Export `SETTINGS_SCOPE` constant to help consumers avoid typos when targeting the reserved scope.

## 1.1.5 - 2025-10-12

- Allow registry entries to be either standard React components or `React.lazy` components via `RegistryComponent`.
- Make `ThemeProvider` generic over the registry payload and require explicit `children`, eliminating the need for casts in consumers.
- Align `useTemplate` with the provider generics so it returns the correct component type (`T | null`).
- Simplify `Template` props by defining `children` directly and returning `null` when no template exists.
