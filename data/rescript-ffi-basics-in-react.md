---
layout: layouts/post.njk
title: "ReScript: FFI basics in React"
excerpt: How to create bindings for common React patterns in ReScript
date: 2021-03-09
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: "2022-02-28"
modifiedDateTime: "2022-02-28 13:28"
created: "2021-03-09"
createdDateTime: "2021-03-09 12:34"
---

A foreign function interface (FFI) is a way for a program written in one language to speak with a program written in another language. In ReScript we are creating FFI bindings to JavaScript. We touched on the concept in the [post about connecting to localStorage](/posts/connect-to-localstorage-with-functors/), but in this post we'll learn some of the most common bindings we encounter while developing a React app in ReScript.

When we write bindings we don't need to specify _all_ the props that a third-party component can receive. By **only binding to the props we use** we will reduce the amount of noise and keep our API cleaner.

## React components

[`react-hot-toast`](https://github.com/timolins/react-hot-toast) is a small and simple package that displays beautiful notifications (toasts). Here are bindings to its `<Toaster>` component and `toast` function.

```reasonml
module Toaster = {
  // JavaScript equivalent
  // import { Toaster } from 'react-hot-toast'
  @react.component @module("react-hot-toast")
  external make: unit => React.element = "Toaster"

  // import ReactHotToast from 'react-hot-toast'
  @module("react-hot-toast")
  external make: t = "default"

  // ReactHotToast.success("Some string")
  @send external success: (t, string) => unit = "success"
}

// Usage in our app
@react.component
let make = () => {
  <>
    <Toaster />
    <button onClick={_ => Toaster.make->Toaster.success("Success!")} />
  </>
}
```

We start by adding two decorators, `@react.component` and `@module("react-hot-toast")`. `@react.component` is the same as the one we use to annotate any React component. `@module("react-hot-toast")` creates a binding that imports from an external package, in this case `react-hot-toast`.

We are happy with the defaults of the `<Toaster>` so we define that the `make` function takes a `unit`, which in this case means no props, and returns a `React.element`. Lastly, we set `"Toaster"` as it is a named export.

The default export of `react-hot-toast` is a function that takes a `string`, but it also has variants for special cases such as _success_. Using the `@send` decorator we can bind to this `success` function. Calling this takes two steps as we first need to create the `Toaster.t` parameter and then pass the text we want to display. The resulting code is in the `onClick` handler.

### With props

Most of the times we want to be able to pass some props to the React components we bind to, so here's another example that binds to [`react-markdown`](https://github.com/remarkjs/react-markdown).

```reasonml
module Markdown = {
  // JavaScript equivalent
  // import ReactMarkdown from 'react-markdown'
  @react.component @module("react-markdown")
  external make: (
    ~children: string,
    ~className: string=?,
  ) => React.element = "default"
}

// Usage in our app
@react.component
let make = () => {
  <Markdown>
    "# I'm an H1"
  </Markdown>
}
```

The difference compared to the binding without props is that the `make` function accepts:

- `children: string` - The children of the component, i.e. the content, is a `string` which will be parsed as markdown to HTML
- `className: string=?` - The `?` denotes that the `className` is an **optional** property

Also, note that we are using `"default"` which imports the default export of the package.

## React hooks

Binding to a React hook is like binding to any other function. Here's an example of a binding to [`use-dark-mode`](https://github.com/donavon/use-dark-mode).

```reasonml
module DarkMode = {
  type t = {
    value: bool,
    toggle: unit => unit,
  }

  // JavaScript equivalent
  // import UseDarkMode from 'use-dark-mode'
  @module("use-dark-mode") external useDarkMode: bool => t = "default"
}

@react.component
let make = () => {
  let darkMode = DarkMode.useDarkMode(false)

  <div>
    {React.string(darkMode.value ? "Dark and sweet" : "Light and clean")}
    <button onClick={_ => darkMode.toggle()}>
      {React.string("Flip the switch")}
    </button>
  </div>
}
```

It's not necessary to create a module for the binding, but I think it encapsulates the binding nicer. The hook takes a `bool` for the initial state and returns `DarkMode.t`. `DarkMode.t` is a ReScript [record](https://rescript-lang.org/docs/manual/latest/record) but these compile to JavaScript objects without any runtime costs and are easier to work with than the alternative method using [ReScript objects](https://rescript-lang.org/docs/manual/latest/bind-to-js-object#bind-using-rescript-object).

## Render prop

Render props aren't very common anymore following the introduction of React hooks, but we still encounter them sometimes. Here's an example of binding to [`Formik`](https://formik.org/docs/api/formik).

```reasonml
module Formik = {
  type renderProps<'values> = {values: 'values}

  // JavaScript equivalent
  // import { Formik } from 'formik'
  @react.component @module("formik")
  external make: (
    ~children: renderProps<'values> => React.element,
    ~initialValues: 'values,
  ) => React.element = "Formik"
}

type form = {name: string}

@react.component
let make = () => {
  <Formik initialValues={% raw %}{{name: "React"}}{% endraw %}>
    {({values}) => {
      <div> {React.string(values.name)} </div>
    }}
  </Formik>
}
```

Now it's getting more complex and it's the first time we are using a [type parameter](https://rescript-lang.org/docs/manual/latest/type#type-parameter-aka-generic) aka generic! We start by defining a React component for `<Formik>`. It accepts two props:

- `children: renderProps<'values> => React.element` - The child should be a function that gets the `renderProps` record (with the generic `'values`) and returns a `React.element`
- `initialValues: 'values` - A record with the initial data of the form

We define the type of the values in `type form` and pass a record of that type to Formik's `initialValues` prop. After this, the type of `values` in the render prop will automatically be of the type `form` since it uses the same type parameter as `initialValues` in our binding.

**Note:** Formik has multiple APIs for creating forms and this is not a fully functioning binding. It's just to demonstrate the use of render props.

## Global variables

Sometimes we need to reach out and connect to a global variable. This is exactly what we did in the previous post [about connecting to localStorage](/posts/connect-to-localstorage-with-functors/). I'll include the code example here but if you want to learn more about it see the previous post.

```reasonml
@val @scope("localStorage") external getItem: string => Js.Nullable.t<string> = "getItem"
@val @scope("localStorage") external setItem: (string, string) => unit = "setItem"
```

---

- Cory House. (2022-02-19). [Tweet](https://twitter.com/housecor/status/1495023556358455298)
