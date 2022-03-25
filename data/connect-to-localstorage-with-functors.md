---
layout: layouts/post.njk
title: 'ReScript: Connect to localStorage using FFI and functors'
excerpt: Use ReScripts FFI to connect to the browsers localStorage
date: 2021-03-05
tags:
  - til
  - topic/rescript
  - topic/react
series: rescript
modified: '2021-03-05'
modifiedDateTime: '2021-03-05 12:01'
created: '2021-03-05'
createdDateTime: '2021-03-05 12:01'
---

While creating my [snippets website](https://snippets.willcodefor.beer) I needed to store a value for how the user wants to copy the snippet. To store the value I wanted to use `localStorage` which is very straight-forward to bind to using ReScript's [foreign function interface](https://en.wikipedia.org/wiki/Foreign_function_interface) (FFI).

Writing these bindings is usually one of the harder parts when getting started with ReScript, but the help is getting better with both the [syntax lookup](https://rescript-lang.org/syntax-lookup) and the [docs](https://rescript-lang.org/docs/manual/latest/interop-cheatsheet).

```reasonml
@val @scope("localStorage") external getItem: string => Js.Nullable.t<string> = "getItem"
@val @scope("localStorage") external setItem: (string, string) => unit = "setItem"
```

This is all we need to do to bind to `localStorage`'s `getItem` and `setItem` functions. Let's walk through the parts of one of them.

- `@val` - Bind to a global JavaScript value
- `@scope("localStorage")` - Set the parent scope to "localStorage"
- `external getItem` - An external value and what we want to call it (`getItem`) on the ReScript end.
- `string => Js.Nullable.t<string>` - The function takes one `string`, the key in `localStorage`, and returns a `string` or `null`.
- `"getItem"` - Tells the compiler what the name of the function is on the JavaScript end. This works together with the scope to bind to `localStorage.getItem`

The return value of `getItem` isn't very easy to work with as it could potentially be **any** `string` or `null`. We can improve this by using a [functor](https://rescript-lang.org/docs/manual/latest/module#module-functions-functors), like we [previously used for React Context](/posts/using-usecontext-in-rescript-react), which returns a nice custom hook that uses [variants](https://rescript-lang.org/docs/manual/v8.0.0/variant) instead.

```reasonml
// Storage.res
module type Config = {
  type t

  let key: string
  let fromString: option<string> => t
  let toString: t => string
}
```

We start by creating a `module type` that tells us what the module that is passed in needs to contain.

- `t` is the variant we are transforming the `string` to
- `key` is a what the value should be stored as in `localStorage`
- `fromString` and `toString` handle the conversions of the value from JavaScript land to ReScript and vice versa.

```reasonml
// Storage.res

// module type Config here...

module Make = (Config: Config) => {
  let useLocalStorage = () => {
    let key = Config.key
    let (state, setState) = React.useState(() => getItem(key))

    let setValue = value => {
      setItem(key, value->Config.toString)
      setState(_ => getItem(key))
    }

    (state->Js.Nullable.toOption->Config.fromString, setValue)
  }
}
```

We then add a `Make` module that accepts another module (very meta) of the `Config` type we created above. This returns a `useLocalStorage` hook that wraps the getting and setting using our configuration module.

```reasonml
// FruitBasket.res
module Fruit = {
  type t = Apple | Banana

  let key = "fruit"

  let fromString = value =>
    switch value {
    | Some("apple") => Apple
    | Some("banana") => Banana
    | Some(_)
    | None =>
      Apple
    }

  let toString = value =>
    switch value {
    | Apple => "apple"
    | Banana => "banana"
    }
}

module FruitStorage = Storage.Make(Fruit)

@react.component
let make = () => {
  let (fruit, setFruit) = FruitStorage.useLocalStorage()

  let toggleFruit = _ => {
    switch fruit {
    | Apple => Banana
    | Banana => Apple
    }->setFruit
  }

  <div>
    {fruit->Fruit.toString->React.string}
    <button onClick={toggleFruit}> {React.string("Toggle fruit")} </button>
  </div>
}
```

This is the final part where we are creating a storage setup and a component. We first create a `Fruit` module that implements all the parts of our `Config` module. If we miss something in our implementation of the module the compiler will complain when we try to create a `Storage` in the next step. Note that `fromString` takes care of handling any unknown strings and `null` values, for those cases we always get `Apple`.

To get storage for our fruits we create a `FruitStorage` using `module FruitStorage = Storage.Make(Fruit)`. This contains our `useLocalStorage` hook that we can use in our component to both get the current fruit and update the stored value. Now we have a great way of persisting if we either have an apple or a banana!

If you want to see the implementation I ended up with for my snippets, which is very similar to what we've created, you can take a look at these two files in the repo, [Storage.res](https://github.com/believer/ultisnips-parse/blob/main/packages/web/src/Storage.res) and [SnippetCode.res](https://github.com/believer/ultisnips-parse/blob/main/packages/web/src/SnippetCode.res).
