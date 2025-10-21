# Theme Registry for React

Easy way to manage list of dynamic components / templates through your React project. Under the hood is [@4i4/registry](https://www.npmjs.com/package/@4i4/registry).

## Why this package exists?

This package is React wrapper on top of [@4i4/registry](https://www.npmjs.com/package/@4i4/registry).\
It provides Context Provider, Hook and Component for easy usage of the registry.\
For more information please check the [registry](https://www.npmjs.com/package/@4i4/registry) package.

### Why I need the Context?
From the examples bellow you can see that there is not much of a difference between importing the registry instance or consuming it directly from a context.\
However, if you want to support multiple themes, or/and extending already existing one, you will need to manage the registry from single place.\
That is where the theme-registry it comes to help. You can load the registry only once as theme and then consume it directly.\
If you want to change the theme just switch the registry in the context.

## Installing:

Using npm:
```shell
$ npm install @4i4/theme-registry
```

Using yarn:
```shell
$ yarn add @4i4/theme-registry
```

Using pnpm:
```shell
$ pnpm add @4i4/theme-registry
```

## ThemeProvider:
The theme-registry contains ready for use React Context that will hold the registry instance.\
That way instead of importing the registry each time you need to use it you can directly consume it from the context through the hook or the component that this package provides.

**Example**
```javascript
import Registry from "@4i4/registry";
import { ThemeProvider } from "@4i4/theme-registry";

const registry = new Registry();

<ThemeProvider registry={registry}>
  {children}
</ThemeProvider>
```

## "Template" Component:
One way to consume directly the registry is by using the `<Template />` component.

**Specific props**

| **Prop**   | **Type**                     | **Optional** | **Default value** | **Description**                                  |
|------------|------------------------------|--------------|-------------------|--------------------------------------------------|
| `template` | `array`, `string`            | No           |                   | The template suggestions / search.               |
| `context`  | `string`                     | Yes          | _                 | The default scope. Default value is `_`.         |
| `fallback` | `React Component / Function` | Yes          |                   | Use this component if the main one is not found. |

For more information check [registry.get()](https://gitlab.com/4i4/registry/-/blob/main/README.md#get)

**Example without theme-registry**
```javascript
/** ---- ./registry.js ---- **/
import React from "react";
import Registry from '@4i4/registry';

const registry = new Registry();

registry.set("wrapper", React.lazy(() => import('./templates/Wrapper')));
registry.set("header", React.lazy(() => import('./templates/Header')));
registry.set("footer", React.lazy(() => import('./templates/Footer')));
registry.set("content", React.lazy(() => import('./templates/Content')));

export default registry;

/** ---- ./templates/Page.js ---- **/
import registry from "../registry";

const Wrapper = registry.get("wrapper");
const Header = registry.get("header");
const Footer = registry.get("footer");
const Content = registry.get("content");

const Page = () => {
  return (
    <Wrapper>
      <Header>
        ...
      </Header>
      <Content>
        ...
      </Content>
      <Footer>
        ...
      </Footer>
    </Wrapper>
  )
};

export default Page;
```

**Example with theme-registry**
```javascript
/** ---- ./registry.js ---- **/
import React from "react";
import Registry from '@4i4/registry';

const registry = new Registry();

registry.set("wrapper", React.lazy(() => import('./templates/Wrapper')));
registry.set("header", React.lazy(() => import('./templates/Header')));
registry.set("footer", React.lazy(() => import('./templates/Footer')));
registry.set("content", React.lazy(() => import('./templates/Content')));

export default registry;

/** ---- ./templates/Page.js ---- **/
import { Template } from "@4i4/theme-registry";

const Page = () => {
  return (
    <Template template="wrapper">
      <Template template="header">
        ...
      </Template>
      <Template template="content">
        ...
      </Template>
      <Template template="footer">
        ...
      </Template>
    </Template>
  )
};

export default Page;
```

## "useTemplate":
The other way to consume directly the registry is by using the `useTemplate` hook.

**Params**

| **Param**   | **Type**          | **Optional** | **Description**                                    |
|-------------|-------------------|--------------|----------------------------------------------------|
| `search`    | `string`, `array` | No           | The template suggestions / search.                 |
| `fallback`  | `any`             | Yes          | Return this component if the item is missing.      |
| `scope`     | `string`          | Yes          | The scope in which this key will be retrieve from. |

For more information check [registry.get()](https://gitlab.com/4i4/registry/-/blob/main/README.md#get)

**Example with theme-registry**
```javascript
/** ---- ./registry.js ---- **/
import React from "react";
import Registry from '@4i4/registry';

const registry = new Registry();

registry.set("wrapper", React.lazy(() => import('./templates/Wrapper')));
registry.set("header", React.lazy(() => import('./templates/Header')));
registry.set("footer", React.lazy(() => import('./templates/Footer')));
registry.set("content", React.lazy(() => import('./templates/Content')));

export default registry;

/** ---- ./templates/Page.js ---- **/
import { useTemplate } from "@4i4/theme-registry";

const Page = () => {
  const Wrapper =useTemplate("wrapper");
  const Header = useTemplate("header");
  const Footer = useTemplate("footer");
  const Content = useTemplate("content");

  return (
    <Wrapper>
      <Header>
        ...
      </Header>
      <Content>
        ...
      </Content>
      <Footer>
        ...
      </Footer>
    </Wrapper>
  )
};

export default Page;
```

## "useThemeSettings" and the `_settings` scope

The theme-registry reserves a special scope named `_settings` that can hold arbitrary configuration objects for a theme (palettes, typography, global styles, etc.).

Register each setting under the reserved scope:

```ts
import Registry from "@4i4/registry";
import { SETTINGS_SCOPE } from "@4i4/theme-registry";

const registry = new Registry();

registry.set("palette", { primary: "#e02b20" }, SETTINGS_SCOPE);
registry.set("typography", { headingFont: "Inter" }, SETTINGS_SCOPE);
```

Then inside your components you can merge overrides with the defaults:

```ts
import { useThemeSettings } from "@4i4/theme-registry";

type StarterSettings = {
  palette: Record<string, string>;
  typography: { headingFont: string };
};

const defaults: StarterSettings = {
  palette: { primary: "#e02b20" },
  typography: { headingFont: "Inter" }
};

const palette = useThemeSettings<StarterSettings>("palette", defaults);
const typography = useThemeSettings<StarterSettings>("typography", defaults);
```

Any theme can override the same setting key inside `_settings` before rendering and the hook will merge the override with the defaults while preserving the overall settings type.

## "withHOC":
```withHOC``` is a Higher-Order Component that wraps your component dynamically with a template and scope.

**Params**

| **Param**   | **Type**          | **Optional** | **Description**                                    |
|-------------|-------------------|--------------|----------------------------------------------------|
| `Component` | `ComponentType`   | No           | The React component to wrap.                       |
| `search`    | `string`, `array` | No           | The template suggestions / search.                 |
| `scope`     | `string`          | Yes          | The scope in which this key will be retrieve from. |

**Example**
```javascript
/** ---- ./registry.js ---- **/
import React from "react";
import Registry from '@4i4/registry';

const registry = new Registry();

registry.set("button", React.lazy(() => import('./templates/button')));
registry.set("withLogger", React.lazy(() => import('./templates/withLogger')));

export default registry;

/** ---- ./templates/button.js ---- **/
import { withHOC } from "@4i4/theme-registry";

const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick}>{children}</button>
  )
};

export default withHOC(Button, "withLogger");

/** ---- ./templates/withLogger.js ---- **/
const withLogger = ({ Component, ...props }) => {
  console.log('Props received:', props);
  return (
    <Component {...props} />
  )
};

export default withLogger;
```

### Normal HOC vs withHOC

**Normal HOC**
```javascript
const withLogger = (Component) => {
  const WrappedComponent = (props) => {
    console.log('Props received:', props);
    return <Component {...props} />;
  };
  return WrappedComponent;
}
```

**HOC using withHOC style**
```javascript
const withLogger = ({ Component, ...props }) => {
  console.log('Props received:', props);
  return (
    <Component {...props} />
  )
};
```

## Basic Example:
Setup the registry:
```javascript
/** ---- ./registry.js ---- **/
import React from "react";
import Registry from "@4i4/registry";

const registry = new Registry();

registry.set("wrapper", React.lazy(() => import('./templates/Wrapper')));
registry.set("header", React.lazy(() => import('./templates/Header')));
registry.set("footer", React.lazy(() => import('./templates/Footer')));
registry.set("content", React.lazy(() => import('./templates/Content')));
registry.set("page", React.lazy(() => import('./templates/Page')));

export default registry;
```

Provide the registry:
```javascript
/** ---- ./app.js ---- **/
import { Suspense } from 'react';
import { ThemeProvider, Template } from "@4i4/theme-registry";
import registry from "./registry";

const App = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ThemeProvider registry={registry}>
        <Template template="page" />
      </ThemeProvider>
    </Suspense>
  );
};

export default App;
```

Consume the registry:
```javascript
/** ---- ./templates/page.js ---- **/
import { useTemplate } from "@4i4/theme-registry";

const Page = () => {
  const Wrapper = useTemplate("wrapper");
  const Header = useTemplate("header");
  const Footer = useTemplate("footer");
  const Content = useTemplate("content");

  return (
    <Wrapper>
      <Header>
        ...
      </Header>
      <Content>
        ...
      </Content>
      <Footer>
        ...
      </Footer>
    </Wrapper>
  )
};
```

## Next.JS Example:
Setup the registry:
```javascript
/** ---- ./registry.js ---- **/
import dynamic from "next/dynamic";
import Registry from "@4i4/registry";

const registry = new Registry();

registry.set("wrapper", dynamic(() => import('./templates/Wrapper')));
registry.set("header", dynamic(() => import('./templates/Header')));
registry.set("footer", dynamic(() => import('./templates/Footer')));
registry.set("content", dynamic(() => import('./templates/Content')));
registry.set("page", dynamic(() => import('./templates/Page')));

export default registry;
```

## Multi-theme Example:
Setup the registry for default theme:
```javascript
/** ---- ./themes/default/registry.js ---- **/
import React from "react";
import Registry from "@4i4/registry";

const registry = new Registry();

registry.set("wrapper", React.lazy(() => import('./templates/Wrapper')));
registry.set("header", React.lazy(() => import('./templates/Header')));
registry.set("footer", React.lazy(() => import('./templates/Footer')));
registry.set("content", React.lazy(() => import('./templates/Content')));
registry.set("page", React.lazy(() => import('./templates/Page')));

export default registry;
```

Setup the registry for the second theme:
```javascript
/** ---- ./themes/second/registry.js ---- **/
import React from "react";
import defaultTheme from '../default/registry';

const registry = defaultTheme.clone();

registry.set("header", React.lazy(() => import('./templates/Header')));

export default registry;
```

Provide the registry:
```javascript
/** ---- ./app.js ---- **/
import { Suspense, useState } from 'react';
import { ThemeProvider, Template } from "@4i4/theme-registry";

import defaultTheme from "./themes/default/registry";
import secondTheme from "./themes/second/registry";

const App = () => {
  const [theme, setTheme] = useState('defaultTheme');
  const themes:any = {
    defaultTheme,
    secondTheme
  };
  
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ThemeProvider registry={themes[theme]}>
        <Template template="page" />
      </ThemeProvider>
    </Suspense>
  );
};

export default App;
```
