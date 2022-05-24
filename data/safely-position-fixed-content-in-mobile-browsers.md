---
layout: layouts/post.njk
title: safely position fixed content on newer mobile devices
excerpt: 'Use one CSS function to safely position fixed content on mobile devices with notches and home bars'
date: 2021-05-20
slug: fixed
tags:
  - til
  - topic/css
modified: '2021-05-21'
modifiedDateTime: '2021-05-21 07:38'
created: '2021-05-20'
createdDateTime: '2021-05-20 16:17'
---

If we want to position fixed content safely on a mobile device that has a notch and/or a home bar, such as the iPhone X or iPhone 12, we need to take into account the safe area of the device. This is especially important if we have interactive elements, such as links or buttons, in the content. Luckily, there's a <dfn><abbr title="Cascading Style Sheets">CSS</abbr></dfn> function that can help us!

Let's say we're creating a cookie consent that contains a link.

```html
<div class="cookie-consent">
  <p>By using this app you consent to our usage of cookies.</p>
  <a href="#">I understand</a>
</div>
```

```css
.cookie-consent {
  background-color: #fff;
  bottom: 0px;
  left: 0px;
  padding: 20px;
  position: fixed;
  right: 0px;
}
```

If we don't add any specific spacing the link would fall below the safe area and it wouldn't be clickable.

<div class="flex flex-col items-end mt-8 mb-4 md:flex-row gap-5">
  <div class="flex flex-col items-center">
    <img class="!my-0" alt="User hasn't scrolled and the link is clickable" src="/without-safe-area.png" />
    <small class="block mt-4 text-center text-gray-700 dark:text-gray-400">The user hasn't scrolled, link is clickable.</small>
  </div>
  <div class="flex flex-col items-center">
    <img class="!my-0" alt="User has scrolled and the link is below the safe area and not clickable" src="/without-safe-area-scrolled.png" />
    <small class="block mt-4 text-center text-gray-700 dark:text-gray-400">Scrolled, link is below safe area and not clickable.</small>
  </div>
</div>

The padding needed to move the content above the safe area can vary between devices, but here's where the magic <abbr title="Cascading Style Sheets">CSS</abbr> function comes to the rescue. We just need one line to fix this on every device:

```css
.cookie-consent {
  /* Previous content... */
  padding-bottom: calc(env(safe-area-inset-bottom) + 20px);
}
```

<div class="flex flex-col items-end mt-8 mb-4 md:flex-row gap-5">
  <div class="flex flex-col items-center">
    <img class="!my-0" alt="User hasn't scrolled and the link is clickable" src="/with-safe-area.png" />
    <small class="block mt-4 text-center text-gray-700 dark:text-gray-400">The user hasn't scrolled, link is clickable.</small>
  </div>
  <div class="flex flex-col items-center">
    <img class="!my-0" alt="User has scrolled and the link is above the safe area and is clickable" src="/with-safe-area-scrolled.png" />
    <small class="block mt-4 text-center text-gray-700 dark:text-gray-400">Scrolled, link is <em class="font-italic">above</em> safe area and is clickable.</small>
  </div>
</div>

> There's also `safe-area-inset-top`, `safe-area-inset-right`, and `safe-area-inset-left` if you have content that needs to be adjusted for other directions

This uses [environment variables](<https://developer.mozilla.org/en-US/docs/Web/CSS/env()>), `safe-area-inset-bottom` in this case, that are provided in the browser and adds that to the padding we already had.

The browser support for this is [very good](https://caniuse.com/css-env-function) and it should be supported on all devices that require the adjustment.
