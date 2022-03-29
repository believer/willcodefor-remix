---
layout: layouts/post.njk
title: how I add Tailwind to my ReScript projects
excerpt: How to add Tailwind CSS to a ReScript project
date: 2021-04-16
tags:
  - til
  - topic/rescript
  - topic/react
  - topic/css
series: rescript
modified: '2021-04-16'
modifiedDateTime: '2021-04-16 07:59'
created: '2021-04-16'
createdDateTime: '2021-04-16 07:59'
---

I've been using [Tailwind CSS](https://tailwindcss.com/) for a couple of years and I think it's the fastest and most convenient way of styling an app. Since I'm also very fond of ReScript I naturally want to combine the two. Luckily, adding Tailwind to a ReScript project isn't any harder than in a JavaScript app.

I've included some tools and templates in the end if you want to look at complete code or get set up quickly.

This assumes that you have an existing ReScript project where you want to add Tailwind. Start by adding the necessary dependencies, if you are using [`vite`](https://vitejs.dev/) you won't need `postcss`.

```bash
npm install --dev tailwindcss postcss autoprefixer
```

We are now ready to run `npx tailwindcss init -p`, this will create two files for us:

- `tailwind.config.js` - A default Tailwind configuration
- `postcss.config.js` - A PostCSS configuration with Tailwind and Autoprefixer

To add all of Tailwind's features we create a CSS file inside the `src` folder with the following content.

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

We then import this CSS file in our ReScript code, I usually put it in my entry file. If you use `es6` output, you would add

```reasonml
// Index.res
%%raw("import './index.css'")
```

Or, if you use `commonjs` as your output

```reasonml
// Index.res
%%raw("require('./index.css')")
```

That should be it! `webpack`, `vite`, or whatever you use should pick up the CSS and compile all of Tailwind's classes.

### Tools and templates

To make the process of integrating ReScript and Tailwind even easier, here are some tools and templates to help you.

- [Supreme](https://github.com/opendevtools/supreme) - A CLI I've written that can quickly set up a ReScript template with Tailwind (JIT and dark mode included) and Vite. Just the way I like it.
- [Next.js + Tailwind](https://github.com/ryyppy/rescript-nextjs-template) - A Next.js template with Tailwind created by [@ryyppy](https://twitter.com/ryyppy)
