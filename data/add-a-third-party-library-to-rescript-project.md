---
layout: layouts/post.njk
title: 'ReScript: Adding a third-party library'
excerpt: How to add a third-party library to your ReScript code
date: 2021-01-25
tags:
  - til
  - topic/rescript
series: rescript
modified: '2021-01-25'
modifiedDateTime: '2021-01-25 11:02'
created: '2021-01-25'
createdDateTime: '2021-01-25 11:02'
---

Sometimes we want to include a library that extends our code. To add a third-party library to our ReScript code we use `npm` as we would in a JavaScript project, but after installing we need to adjust our ReScript configuration to include the new code.

We start by installing the library using `npm` or `yarn`. For this example, I'll be using [`@opendevtools/rescript-telefonnummer`](https://github.com/opendevtools/rescript-telefonnummer).

```shell
npm install --save @opendevtools/rescript-telefonnummer
```

After the installation is complete we need to add the library name in our `bsconfig.json` in the `bs-dependencies` array.

```json
// bsconfig.json
{
  ...
  "bs-dependencies": [
    ...,
    "@opendevtools/rescript-telefonnummer"
  ]
}
```

After saving, the compiler will pick up that a change has been made in the configuration and build the library. We're now ready to start using the library in our code.
