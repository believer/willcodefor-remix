---
layout: layouts/post.njk
title: "ReScript: Using useState in rescript-react"
excerpt: How to use React's useState in ReScript using rescript-react
date: 2021-01-25
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: "2021-01-25"
modifiedDateTime: "2021-01-25 15:02"
created: "2021-01-25"
createdDateTime: "2021-01-25 15:02"
---

React has a `useState` hook that's great for keeping track of some simple state. rescript-react also has this hook, but the API is a bit different in that it only contains the function variations of `useState`. Here's a basic example that extends the example we [created previously](/posts/using-react-components-in-rescript/).

```reasonml
@react.component
let make = () => {
  let (displayValue, setDisplayValue) = React.useState(() => false)

  <div>
    {displayValue ? React.string("The best value") : React.null}
    <Button onClick={_ => setDisplayValue(displayValue => !displayValue)}>
      {React.string("Toggle value")}
    </Button>
  </div>
}
```

`React.useState` takes a function where the return value is our initial state. In return, we get a [`tuple`](https://rescript-lang.org/docs/manual/latest/tuple) of the current state and a setter. The types for the return values are inferred from the initial state. In this case the types are `bool` for `displayValue` and `(bool => bool) => unit` for `setDisplayValue`.

We could then use the value, defined as `displayValue` in our example, to conditionally display a text. Both sides of the ternary need to have the same type so we use `React.null`, which maps to `React.element` like `React.string` does, when we don't want to display anything.

To update the value we call the setter function, defined as `setDisplayValue` in our example. In this case, we toggle the `displayValue` based on the previous value.

The [bindings for `useState`](https://github.com/reasonml/reason-react/blob/master/src/React.re#L192) to the React implementation acknowledges that the API isn't the best, but the only way to implement the state with type safety. The recommendation is to [use `useReducer`](/posts/using-usereducer-in-rescript-react/) whenever possible.
