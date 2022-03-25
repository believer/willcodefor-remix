---
layout: layouts/post.njk
title: 'ReScript: Using React components'
excerpt: How to use React components in ReScript using rescript-react
date: 2021-01-22
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: '2021-01-22'
modifiedDateTime: '2021-01-22 14:50'
created: '2021-01-22'
createdDateTime: '2021-01-22 14:50'
---

In [the previous post](/posts/create-a-rescript-react-component/), we learned how to create React components in ReScript. In this post, we'll learn how to import and use them in other components. We'll start by making some adjustments to the `<Button>` we created.

```reasonml
// Button.res
@react.component
let make = (~children, ~onClick) => {
  <button onClick> children </button>
}
```

We have changed the button child from `React.string("Click me")` to `children` and added a prop for `~children` in the component function. This way we can reuse the button with different contents. The type of the `children` prop is inferred as `React.element` and it is **required**.

```reasonml
// App.res
@react.component
let make = () => {
  <div> <Button /> </div>
}
```

Here we use our `<Button>` component inside another component called `<App>`. As we saw in the last post, all files are modules and globally available in ReScript. Therefore we can add the `<Button>` to our JSX without having to import any files beforehand.

If we save now, we get an error in the compiler that we are missing the required properties for the `<Button>`.

```reasonml
  1 │ @react.component
  2 │ let make = () => {
  3 │   <div> <Button /> </div>
  4 │ }

  This has type:
    (~children: 'a, ~onClick: 'b) => {"children": 'a, "onClick": 'b}
  Somewhere wanted:
    {"children": React.element, "onClick": ReactEvent.Mouse.t => unit}
```

Let's add the props to satisfy the compiler.

```reasonml
@react.component
let make = () => {
  <div>
    <Button onClick={_event => ()}> {React.string("Click me")} </Button>
  </div>
}
```

`onClick` gets a function defined as `_event => ()`. The underscore before `event` tells the compiler that the variable is unused and we return a [unit](https://rescript-lang.org/docs/manual/latest/primitive-types#unit), `()`, which compiles to JavaScript's `undefined`.

Lastly, we re-add the button text from before as a child to `<Button>`, and we have successfully used our `<Button>` component!
