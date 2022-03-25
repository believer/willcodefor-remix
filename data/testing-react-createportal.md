---
layout: layouts/post.njk
title: testing React createPortal with Testing Library
date: 2020-10-22
url: https://dev.to/believer/testing-react-createportal-with-testing-library-1mj6
tags:
  - til
  - topic/react
  - topic/jest
  - topic/testing
modified: '2020-10-22'
modifiedDateTime: '2020-10-22 10:33'
created: '2020-10-22'
createdDateTime: '2020-10-22 10:33'
---

I have a component that uses `ReactDOM.createPortal` and appends it to a DOM node that is passed as a prop. However, I couldn't find a good example of testing it using Testing Library.

I've created a [CodeSandbox](https://codesandbox.io/s/reactdomcreateportal-testing-x1icz) with some extended tests if you want to follow along using an interactive example.

```jsx
// App.js
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const App = ({ root }) => {
  const [container] = useState(document.createElement("div"));

  useEffect(() => {
    root.appendChild(container);

    return () => {
      root.removeChild(container);
    };
  }, [container, root]);

  return ReactDOM.createPortal(<div>Portal content</div>, container);
};

export default App;
```

The component receives a DOM node, `root`, through props. The portal component is then appended to `root` inside `useEffect`.

At first, I thought that I could use `screen.getByText` to get the text "Portal content", but since th content is mounted to `root` I can't use the `screen` queries.

```jsx
// App.test.js
import { render, within } from "@testing-library/react";
import React from "react";
import App from "./App";
import "@testing-library/jest-dom/extend-expect";

test("appends the element when the component is mounted", () => {
  const root = document.createElement("div");

  render(<App root={root} />);

  const { getByText } = within(root);

  expect(root).toContainElement(getByText(/portal content/i));
});
```

After some searching, I found `within` – also called `getQueriesForElement` – in the [Testing Library docs](https://testing-library.com/docs/dom-testing-library/api-helpers#within-and-getqueriesforelement-apis) which seemed to fit this case perfectly. Passing `root` to `within` gives me all the queries that I'm used to from `screen`.

Using `toContainElement` from `jest-dom/extend-expect` I can then write an assertion that is similar to how I would normally write it.

```jsx
// Our example
expect(root).toContainElement(getByText(/portal content/i));

// How I would normally test it
expect(screen.getByText(/portal content/i)).toBeInTheDocument();
```
