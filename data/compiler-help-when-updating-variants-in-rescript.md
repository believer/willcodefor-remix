---
layout: layouts/post.njk
title: 'ReScript: Adding new actions to an existing useReducer'
excerpt: 'How the ReScript compiler helps us when adding new variants to a
useReducer in rescript-react'
date: 2021-01-27
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: '2021-01-27'
modifiedDateTime: '2021-01-27 12:08'
created: '2021-01-27'
createdDateTime: '2021-01-27 12:08'
---

[Previously](/posts/using-usereducer-in-rescript-react/) we updated a React component to use the `useReducer` hook in rescript-react. In this post, we'll add a couple of new actions to our reducer and see how the compiler helps us with adding these new features.

```reasonml
type action = Toggle | Display | Hide
```

We start by adding two new actions to the `action` type called `Display` and `Hide`. After we save we'll get an error in the compiler saying that we haven't covered all cases in our reducer's pattern match. It even tells us that we are missing `(Display|Hide)`. This is exactly what we want!

```reasonml
Warning number 8 (configured as error)

 6 │ let make = () => {
 7 │   let (state, dispatch) = React.useReducer((state, action) => {
 8 │     switch action {
 9 │     | Toggle =>
 . │ ...
13 │       }
14 │     }
15 │   }, HideValue)
16 │

You forgot to handle a possible case here, for example:
(Display|Hide)
```

Let's add the new actions to our reducer.

```reasonml
switch action {
| Display => DisplayValue
| Hide => HideValue
| Toggle =>
  ...
}
```

By handling both the `Display` and `Hide` case the compiler will be happy, but we don't have anything that triggers our new actions so let's add those next.

```reasonml
<Button onClick={_ => dispatch(Display)}> {React.string("Display value")} </Button>
<Button onClick={_ => dispatch(Hide)}> {React.string("Hide value")} </Button>
```

By adding two `<Button>` components that trigger our new actions when clicked we've successfully added the new functionality to our `useReducer`. The complete updated example looks like this

```reasonml
type state = DisplayValue | HideValue

type action = Toggle | Display | Hide

@react.component
let make = () => {
  let (state, dispatch) = React.useReducer((state, action) => {
    switch action {
    | Display => DisplayValue
    | Hide => HideValue
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
    <Button onClick={_ => dispatch(Display)}> {React.string("Display value")} </Button>
    <Button onClick={_ => dispatch(Hide)}> {React.string("Hide value")} </Button>
  </div>
}
```
