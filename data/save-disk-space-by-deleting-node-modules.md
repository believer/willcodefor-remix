---
layout: layouts/post.njk
title: save disk space by deleting unused node_modules
excerpt: 'Reclaim a lot of disk space by deleting unused node_modules from projects
that you are not actively using'
date: 2021-11-13
tags:
  - til
  - topic/shell
modified: '2021-11-13'
modifiedDateTime: '2021-11-13 13:50'
created: '2021-11-13'
createdDateTime: '2021-11-13 13:50'
---

If you're like me and have a bunch of side projects, chances are that you also have a ton of `node_modules` folders taking up unnecessary space. I'm going to show you a command to delete all of them at once. Last time I used it I saved ~40 GB. I would recommend deleting all of them and then reinstalling in the projects you're actively developing. Start off with a clean slate.

```bash
# Use the command at you own risk
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
```

There's a lot to the command, but here's an explanation of each part to
demystify it.

- `find` - A command that comes built-in with MacOS and Linux.
- `.` - Look from this location
- `-name "node_modules"` - Make sure the last component of the pathname matches `node_modules`
- `-type d` - We are looking for a **directory** (d)
- `-prune` - Stops `find` from descending into the folder, meaning that it won't
  look for `node_modules` inside `node_modules` and so on.
- `-exec rm -rf '{}' +` - Runs the specified command, `rm`, with flags `r` (remove directory) and `f` (do not ask for confirmation no matter what the file permissions are). `'{}'` will be replaced by the pathname that's been found. `+` means that `find` will append all the file paths to a single command instead of running `rm` for each.

If you only want to find `node_modules` folders and display their disk size use
the following command.

```bash
find . -name "node_modules" -type d -prune -print | xargs du -chs
```

> There's also an `npm` command that you can use by running `npx npkill` if you
> don't want to mess with terminal commands.
