# Changelog

## Unreleased

- Allow registry entries to be either standard React components or `React.lazy` components via `RegistryComponent`.
- Make `ThemeProvider` generic over the registry payload and require explicit `children`, eliminating the need for casts in consumers.
- Align `useTemplate` with the provider generics so it returns the correct component type (`T | null`).
- Simplify `Template` props by defining `children` directly and returning `null` when no template exists.
