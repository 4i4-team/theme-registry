import React, {
  ComponentType,
  ElementType,
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useMemo
} from "react";
import Registry from "@4i4/registry";

type RegistryComponent =
  | ComponentType<any>
  | React.LazyExoticComponent<ComponentType<any>>;
type RegistryComponentType = Registry<RegistryComponent>;
type ThemeProviderProps<T extends RegistryComponent = RegistryComponent> = {
  registry: Registry<T>;
  children: ReactNode;
};
type TemplateType = {
  template: string | string[];
  context?: string;
  fallback?: RegistryComponent | null;
  children?: ReactNode;
  [key: string]: any;
};

const formatSearchLabel = (search: string | string[]) =>
  Array.isArray(search) ? search.join(", ") : search;

const createMissingTemplateFallback = (
  search: string | string[]
): RegistryComponent => {
  const formattedSearch = formatSearchLabel(search);
  const MissingTemplate: ComponentType<any> = () => (
    <span>Missing template: {formattedSearch}</span>
  );
  MissingTemplate.displayName = `MissingTemplate(${formattedSearch})`;
  return MissingTemplate;
};

const ThemeContext = createContext<RegistryComponentType | undefined>(
  undefined
);

export const SETTINGS_SCOPE = "_settings";

export const useTemplate = <T extends RegistryComponent = RegistryComponent>(
  search: string | string[],
  fallback?: T | null,
  scope?: string
): T | null => {
  const registry = useContext(ThemeContext);
  if (registry === undefined)
    throw new Error(
      "useTemplate must be inside a ThemeProvider with a registry"
    );
  const fallbackToUse =
    fallback === undefined
      ? (createMissingTemplateFallback(search) as T)
      : fallback;
  return registry.get(search, fallbackToUse, scope) as T | null;
};

export const useThemeSettings = <
  TSettings extends object,
  TKey extends keyof TSettings
>(
  setting: TKey,
  defaultSettings?: TSettings
): TSettings[TKey] | undefined => {
  const registry = useContext(ThemeContext);
  if (registry === undefined) {
    throw new Error(
      "useThemeSettings must be inside a ThemeProvider with a registry"
    );
  }

  return useMemo(() => {
    const overrides = registry.get(
      setting as string,
      null,
      SETTINGS_SCOPE
    ) as TSettings[TKey] | null;

    const baseValue = defaultSettings?.[setting];
    if (!overrides) return baseValue;

    if (
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue)
    ) {
      return {
        ...(baseValue as Record<string, unknown>),
        ...(overrides as Record<string, unknown>),
      } as TSettings[TKey];
    }

    return (overrides as TSettings[TKey]) ?? baseValue;
  }, [defaultSettings, registry, setting]);
};

export function withHOC<P extends object>(
  Component: React.ComponentType<P>,
  search: string | string[],
  scope?: string
) {
  const displayName = Component.displayName || Component.name || "Component";
  const WithWrapper = (props: P) => {
    const Wrapper = useTemplate(search, null, scope) as ElementType | null;
    if (!Wrapper) return <Component {...props} />;
    return <Wrapper {...props} Component={Component} />;
  };
  WithWrapper.displayName = `withHOC(${displayName})`;
  return WithWrapper;
}

export function ThemeProvider<T extends RegistryComponent>({
  registry,
  children
}: ThemeProviderProps<T>) {
  return (
    <ThemeContext.Provider value={registry as RegistryComponentType}>
      {children}
    </ThemeContext.Provider>
  );
}

export const Template = ({
  template,
  context,
  fallback,
  ...props
}: TemplateType): React.ReactElement | null => {
  return (
    <ThemeContext.Consumer>
      {registry => {
        const fallbackToUse =
          fallback === undefined
            ? createMissingTemplateFallback(template)
            : fallback;
        const Component = registry?.get(template, fallbackToUse, context);
        if (Component) {
          return <Component {...props} />;
        }
        return null;
      }}
    </ThemeContext.Consumer>
  );
};

export const TemplateWithRef = forwardRef<unknown, TemplateType>(
  ({ template, context, fallback, ...props }, ref) => {
    return (
      <ThemeContext.Consumer>
        {registry => {
          const fallbackToUse =
            fallback === undefined
              ? createMissingTemplateFallback(template)
              : fallback;
          const Component = registry?.get(template, fallbackToUse, context);
          if (Component) {
            return <Component {...props} ref={ref} />;
          }
          return null;
        }}
      </ThemeContext.Consumer>
    );
  }
);
