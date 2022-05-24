---
layout: layouts/post.njk
title: 'ReScript: Using useContext in rescript-react'
excerpt: How to move a useReducer to useContext in ReScript using rescript-react
slug: rescon
date: 2021-01-28
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: '2021-01-28'
modifiedDateTime: '2021-01-28 09:02'
created: '2021-01-28'
createdDateTime: '2021-01-28 09:02'
---

Sometimes we might need some state in multiple places in our app and for this we can use React's Context API to share the data. For the sake of simplicity and building on previous examples, let's assume that we want to get the state from [our `useReducer` example](/posts/using-usereducer-in-rescript-react/) in two different locations.

First of all we need to create a way of sharing the state using context.

```reasonml
// ReactContext.res
module type Config = {
  type context
  let defaultValue: context
}

module Make = (Config: Config) => {
  let t = React.createContext(Config.defaultValue)

  module Provider = {
    let make = React.Context.provider(t)

    @obj
    external makeProps: (
      ~value: Config.context,
      ~children: React.element,
      ~key: string=?,
      unit,
    ) => {"value": Config.context, "children": React.element} = ""
  }

  let use = () => React.useContext(t)
}
```

This might look a bit intimidating at first but bear with me. This new file creates a nice and general way for us to create React contexts using what's called a [functor](https://rescript-lang.org/docs/manual/latest/module#module-functions-functors).

By adding this we only need to provide a `context` type and a `defaultValue`, the values defined in the `module type Config`, to create a new context. Here's an example of creating a context that holds a `bool` value with the default being `false`.

```reasonml
include ReactContext.Make({
  type context = bool
  let defaultValue = false
})
```

The `include` keyword includes all the parts of the `Make` module in `ReactContext`, which means we now have access to both a `<Provider>` and a `use` function that calls `useContext`.

If we combine the newly created `ReactContext` with our state and reducer from the `useReducer` example we get this code.

```reasonml
// ValueSettings.res
type state = DisplayValue | HideValue

type action = Toggle

module Context = {
  include ReactContext.Make({
    type context = (state, action => unit)
    let defaultValue = (HideValue, _ => ())
  })
}

module Provider = {
  @react.component
  let make = (~children) => {
    let (state, dispatch) = React.useReducer((state, action) => {
      switch action {
      | Toggle =>
        switch state {
        | DisplayValue => HideValue
        | HideValue => DisplayValue
        }
      }
    }, HideValue)

    <Context.Provider value=(state, dispatch)> children </Context.Provider>
  }
}
```

We've moved the `state` and `action` types as well as the `useReducer`. We also define a custom `Provider`, instead of using the one from `<Context.Provider>` directly, because we want to be able to update the state using our reducer's `dispatch` function.

Next, we need to include this provider somewhere **above** in the component tree from where we want to use it.

```reasonml
// Index.res
@react.component
let make = () => {
  <ValueSettings.Provider>
    <App />
    <AnotherPart />
  </ValueSettings.Provider>
}
```

Finally, we can return to our `App.res` from the `useReducer` example and modify it to get state and dispatch from the context. Since `ReactContext` created a `use` hook for us, the easiest way to fetch the `state` is to use `ValueSettings.Context.use()` which returns a tuple with the state and dispatch.

```reasonml
// App.res
@react.component
let make = () => {
  let (state, dispatch) = ValueSettings.Context.use()

  <div>
    {switch state {
    | DisplayValue => React.string("The best value")
    | HideValue => React.null
    }}
    <Button onClick={_ => dispatch(Toggle)}> {React.string("Toggle value")} </Button>
  </div>
}
```

If we only wanted to display a value in `<AnotherPart>` we can ignore `dispatch` by adding an underscore and pattern match on the `state`.

```reasonml
// AnotherPart.res
@react.component
let make = () => {
  let (state, _dispatch) = ValueSettings.Context.use()

  switch state {
  | DisplayValue => React.string("This is another great value")
  | HideValue => React.null
  }
}
```

This is the most complicated topic we've covered so far. If you have any questions or ways of clarifying a step feel free to reach out to me on [Twitter](https://twitter.com/rnattochdag).
