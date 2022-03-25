---
layout: layouts/post.njk
title: how to lint HTML using CSS
date: 2020-06-23
url: https://dev.to/believer/how-to-lint-html-using-css-5dc
tags:
  - til
  - topic/html
  - topic/css
  - topic/a11y
modified: '2020-06-23'
modifiedDateTime: '2020-06-23 13:37'
created: '2020-06-23'
createdDateTime: '2020-06-23 13:37'
---

The following CSS rules will help you highlight potential semantic and [accessibility](https://a11yproject.com/) (a11y) issues you might have on your website.

## Missing alt attributes

The `alt` attribute provides a fallback for images that aren't able to load. The attribute is also important for a11y since screen readers will read the text to the user.

**Rule of thumb:** When choosing `alt` strings for your images, imagine what you would say when reading the page to someone over the phone without mentioning that there's an image on the page.

Images without semantic meaning should have the `alt` attribute set to `""`.

```css
/* Find images with missing alt attributes */
img:not([alt]) {
  outline: 2px dotted red;
}
```

## Links without a destination

This trick will highlight links that do not have an `href` attribute, an empty `href`, or an `href` set to #.

```css
/* Links that go nowhere */
a:is(:not([href]), [href=""], [href="#"]) {
  outline: 2px dotted red;
}
```

## Tabindex that's not 0 or -1

Elements that use the `tabindex` attribute with a value other than 0 or -1 might disrupt the natural flow of the website. This might make navigating especially difficult for people who rely on assistive technology.

```css
/* Potential tabindex problems */
[tabindex]:not([tabindex="0"], [tabindex="-1"]) {
  outline: 2px dotted red;
}
```

## Invalid children in lists

According to [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul), `<li>` is the only element, apart from `<script>` and `<template>`, that is semantically allowed inside `<ul>` and `<ol>`. This trick helps you spot any invalid elements.

```css
/* Invalid list elements */
:is(ul, ol) > *:not(li) {
  outline: 2px dotted red;
}
```

## Images with missing width and height

Images that are missing `width` and `height` might cause page load jank and [Cumulative Layout Shift](https://web.dev/cls/) (CLS) when the images are loaded.

```css
/* Images without width and height */
img:not([width]):not([height]) {
  filter: blur(20px);
}
```
