import React, {
  ComponentType,
  createContext,
  FC,
  forwardRef,
  PropsWithChildren,
  useContext
} from "react";
import Registry from "@4i4/registry";

type RegistryComponentType = Registry<
  ComponentType<any> & Promise<ComponentType<any>>
>;
type ThemeProviderProps = {
  registry: RegistryComponentType;
};
type TemplateType = {
  template: string | string[];
  context?: string;
  fallback?: ComponentType<any> & Promise<ComponentType<any>>;
  [key: string]: any;
};

const ThemeContext = createContext<RegistryComponentType | undefined>(
  undefined
);

export const useTemplate = (
  search: string | string[],
  fallback?: (ComponentType<any> & Promise<ComponentType<any>>) | null,
  scope?: string
) => {
  const registry = useContext(ThemeContext);
  if (registry === undefined)
    throw new Error(
      "useTemplate must be inside a ThemeProvider with a registry"
    );
  return registry?.get(search, fallback, scope);
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

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  registry,
  ...props
}) => {
  return <ThemeContext.Provider value={registry} {...props} />;
};

export const Template: FC<PropsWithChildren<TemplateType>> = ({
  template,
  context,
  fallback,
  ...props
}) => {
  return (
    <ThemeContext.Consumer>
      {registry => {
        const Component = registry?.get(template, fallback, context);
        if (Component) {
          return <Component {...props} />;
        }
        return <></>;
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
          return <></>;
        }}
      </ThemeContext.Consumer>
    );
  }
);
