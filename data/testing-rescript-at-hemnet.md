---
layout: layouts/post.njk
title: testing ReasonML at Sweden's largest property portal, Hemnet
date: 2020-05-15
slug: reshemnet
url: https://dev.to/believer/testing-reasonml-at-sweden-s-largest-property-portal-hemnet-620
tags:
  - til
  - topic/reasonml
  - topic/react
  - topic/hemnet
modified: '2021-11-23'
modifiedDateTime: '2021-11-23 13:31'
created: '2020-05-15'
createdDateTime: '2020-05-15 13:04'
---

Each week [Hemnet](https://www.hemnet.se) has 2.8 million unique visitors, which is quite a lot in a country with about 10 million inhabitants.

A couple of times per year we have a competence development day where we are allowed to test out new tech or read up on new developments. I chose to integrate ReasonML in our main app.

If you've never heard about Reason, then the new [documentation website](http://rescript-lang.org/) is a great start.

## The experiment

The app is currently a large codebase of Ruby on Rails and React (JavaScript). Therefore, a perfect place to try out some type-safety.

I chose to convert a component that contains a bunch of normal use-cases, e.g. importing other components/images, sending tracking events, and using React context.

## Code

These are answers to some questions I got from colleagues about the code.

### No import statements

All modules, every `.re` file is a module in Reason, are globally accessible. This might seem like an issue, but with [good naming and structue](https://dev.to/yawaramin/a-modular-ocaml-project-structure-1ikd), it's perfectly fine.

### `React.string("text")`

React accepts a bunch of types as valid children (numbers, strings, elements, or an array), but since Reason is statically typed everything needs to be mapped to a consistent type. Therefore, we use `React.string` to tell the compiler that this string will map to a `React.element`. There's a function for each other case `React.int`, `React.float`, and `React.array`.

### Pattern matching and option types

In Reason, `null` and `undefined` does not exist. When doing interop with JavaScript, a possibly `undefined` prop will map to Reason's [option type](https://reasonml.org/docs/manual/latest/null-undefined-option), which is either `Some(value)` or `None`.

```reasonml
{switch (price) {
 | Some(price) =>
   <span className="mb-2">
     <PriceBox price originalPrice />
   </span>
 | None => React.null
}}
```

Reason forces us, in a good way, to address all possible states and since the cases of a switch need to return the same type, we return `React.null` when `price` is `None`. In JavaScript we had

```js
{
  price && (
    <span className="signup-toplisting-promo__price">
      <PriceBox price={price} originalPrice={originalPrice} />
    </span>
  )
}
```

### Props

In the following example, it might look like the props don't have a value. This is because of [punning](https://reasonml.org/docs/manual/latest/function), which is a shorthand when a variable has the same name as the prop, i.e. `price={price}` becomes `price`.

```reasonml
let price = 50;
let originalPrice = 100;

<PriceBox price originalPrice />
```

## Bindings to JavaScript code

We were using a `Heading` from our component library, so that needed a binding. [`as`](https://reasonml.org/docs/manual/latest/reserved-keywords) is a reserved keyword in Reason, but not in JavaScript. By adding an [underscore in front](https://reasonml.org/docs/reason-compiler/latest/handling-js-naming-collisions#using-reserved-keywords-as-jsx-props) we can use it in Reason and the compiler will remove it in the compiled code. This is called [name mangling](https://reasonml.org/docs/reason-compiler/latest/handling-js-naming-collisions#special-name-mangling-rules-for-js-object-attribute-names).

```reasonml
/* Hemnet.re */

module Heading = {
  [@bs.module "@hemnet/react"] [@react.component]
  external make:
    (~_as: string, ~styleType: string, ~children: React.element) =>
    React.element =
    "Heading";
};

/* Usage */
<Hemnet.Heading _as="h2" styleType="h3">
  {React.string("Raketen")}
</Hemnet.Heading>
```

For sending tracking events to Google Analytics I created a module that made it clearer what the actual parameters are using labeled arguments. No more need to keep in mind which order the params are supposed to be.

```reasonml
/* GoogleAnalytics.re */
/* Binds to the global variable `ga` */
[@bs.val] external ga: (string, string) => unit = "ga";

let track = (~category, ~action) => ga(category, action);

/* Usage */
GoogleAnalytics.track(
  ~category="event-category",
  ~action="event-action",
)
```

**NOTE:** The bindings could be made even more type-safe. For example by using [variants](https://reasonml.org/docs/manual/latest/variant) to only allow specific values to be sent to the JavaScript code.

## Testing

Testing remains the same as we can still use the same setup with Jest and target the compiled code.

## Metrics

A clean build, running `bsb -clean-world` to remove all the compiled code and then `bsb -make-world`, compiles the Reason code in about **200 ms**.

![Screenshot 2020-05-14 09 36 57](https://user-images.githubusercontent.com/1478102/81910514-5a5af980-95cc-11ea-8951-3aa466ac423d.png)

When the compiler is running in watch mode it'll compile file changes even faster.

![Screenshot 2020-05-14 09 37 36](https://user-images.githubusercontent.com/1478102/81910517-5af39000-95cc-11ea-84e0-99e09c67853f.png)

This is only for a few modules, but when I've used Reason in larger projects, the longest compile times I've seen for a clean build is ~8-10 seconds. When changing files it's usually well below 400ms.

## Final result

The only visual difference is the link color, which is due to a collision between Tailwind (which I also tested out in the experiment) and our global styling. Apart from visuals, the component would now be much safer to use thanks to the great type inference.

| Reason Experiment                                                                                                                      | Production                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ![Screenshot 2020-05-14 09 45 29](https://user-images.githubusercontent.com/1478102/81913092-c854f000-95cf-11ea-8106-51b8998d584b.png) | ![Screenshot 2020-05-14 09 46 45](https://user-images.githubusercontent.com/1478102/81913019-afe4d580-95cf-11ea-8534-e7c3721a4269.png) |
