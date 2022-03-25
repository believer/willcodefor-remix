---
layout: layouts/post.njk
title: close all open Vim buffers except the current
date: 2020-09-29
url: https://dev.to/believer/close-all-open-vim-buffers-except-the-current-3f6i
tags:
  - til
  - topic/vim
modified: '2020-09-29'
modifiedDateTime: '2020-09-29 13:22'
created: '2020-09-29'
createdDateTime: '2020-09-29 13:22'
---

During development, I often use `:ls` to display open buffers. However, after a while, the list can become long. I'm going to add a custom command in my `.vimrc` – which is similar to "Close others" in VS Code – that deletes all buffers, except the one I'm currently on.

```vim
command BufOnly silent! execute "%bd|e#|bd#"
```

- `command` – Define a user command
- `BufOnly` – The command name we want to use
- `silent!` – Silence messages, `!` silences errors too
- `execute` – Execute the following string expression

Now let's breakdown the actual command. The pipes (`|`) break the string into three commands:

- `%bd` – Deletes all open buffers (`bd` is short for `bdelete`)
- `e#` – Opens the last buffer (`e` is short for `edit`)
- `bd#` – Deletes the `[No Name]` buffer that gets created

After restarting Vim or sourcing the updated `.vimrc` I can run `:BufOnly` to clean up my `:ls` list.

## Quick command

Create a binding to run the command quickly whenever needed.

```vim
" I have <leader> mapped to <Space>
nnoremap <leader>b :BufOnly<CR>
```
