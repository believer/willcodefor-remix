---
layout: layouts/post.njk
title: 'ReScript: Using useReducer in rescript-react'
excerpt: How to switch from React's useState to useReducer in ReScript using rescript-react
slug: resurh
date: 2021-01-26
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: '2021-01-26'
modifiedDateTime: '2021-01-26 15:19'
created: '2021-01-26'
createdDateTime: '2021-01-26 15:07'
---

React's `useReducer` is great when the states get more complex than a simple value. rescript-react `useReducer` is even better with ReScript's [variants](https://rescript-lang.org/docs/manual/latest/variant).

Let's update the code from our [`useState`](/posts/using-usestate-in-rescript-react/) implementation step by step to use `useReducer`.

```reasonml
type state = DisplayValue | HideValue

type action = Toggle
```

These types define the state and actions of our reducer. Since we only want to toggle a value, we'll use a variant for the state with two possible values, `DisplayValue` or `HideValue`. We then define the actions we can dispatch to update the state. In this case, we only need one action to `Toggle` the `state`.

```reasonml
let (state, dispatch) = React.useReducer((state, action) => {
  switch action {
  | Toggle =>
    switch state {
    | DisplayValue => HideValue
    | HideValue => DisplayValue
    }
  }
}, HideValue)
```

We replace the `useState` hook with this `useReducer` hook. The reducer uses [pattern matching](https://rescript-lang.org/docs/manual/latest/pattern-matching-destructuring#switch-based-on-shape-of-data) on the action and toggles the state depending on the current state.

The types of `state` and `dispatch` are inferred from the usage as our `state` type and `action => unit` respectively.

```reasonml
<div>
  {switch state {
  | DisplayValue => React.string("The best value")
  | HideValue => React.null
  }}
  <Button onClick={_ => dispatch(Toggle)}> {React.string("Toggle value")} </Button>
</div>
```

The updated view part uses another pattern match on the `state` to either display the value or display nothing. The `onClick` function now uses `dispatch` to pass the `Toggle` action to the reducer.

The complete code would look like this

```reasonml
// App.res
type state = DisplayValue | HideValue

type action = Toggle

@react.component
let make = () => {
  let (state, dispatch) = React.useReducer((state, action) => {
    switch action {
    | Toggle =>
      switch state {
      | DisplayValue => HideValue
      | HideValue => DisplayValue
      }
    }
  }, HideValue)

  <div>
    {switch state {
    | DisplayValue => React.string("The best value")
    | HideValue => React.null
    }}
    <Button onClick={_ => dispatch(Toggle)}> {React.string("Toggle value")} </Button>
  </div>
}
```

This is a simple example that achieves the same thing as our `useState` component did but in a more complex manner. However, if we wanted to [add a dedicated `Display` or `Hide`](/posts/compiler-help-when-updating-variants-in-rescript/) action the compiler would be able to help us so that we don't miss handling any cases in our implementation.
