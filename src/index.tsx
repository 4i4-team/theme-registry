import React, {
  ComponentType,
  createContext,
  forwardRef,
  ReactNode,
  useContext
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

const ThemeContext = createContext<RegistryComponentType | undefined>(
  undefined
);

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
  return registry.get(search, fallback, scope) as T | null;
};

export function withHOC<P extends object>(
  Component: React.ComponentType<P>,
  search: string | string[],
  scope?: string
) {
  const displayName = Component.displayName || Component.name || "Component";
  const WithWrapper = (props: P) => {
    const Wrapper = useTemplate(search, null, scope);
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
        const Component = registry?.get(template, fallback, context);
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
          const Component = registry?.get(template, fallback, context);
          if (Component) {
            return <Component {...props} ref={ref} />;
          }
          return null;
        }}
      </ThemeContext.Consumer>
    );
  }
);
