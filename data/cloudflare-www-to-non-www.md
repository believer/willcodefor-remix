---
layout: layouts/post.njk
title: 'redirect www to non-www in Cloudflare'
excerpt: 'Create a 301 permanent redirect from www to non-www in Cloudflare'
date: 2021-11-29
modified: '2021-11-29'
modifiedDateTime: '2021-11-29 19:31'
created: '2021-11-29'
createdDateTime: '2021-11-29 19:48'
tags:
  - til
  - topic/cloudflare
  - topic/dns
---

While setting up a new domain in Cloudflare I found that I wasn't handling `www` for the domains of this site. What I wanted was to redirect any requests to `www` to non-www, but it turned out to be harder than I expected. Mostly because I'm not great at DNS setups and I had a hard time finding any tutorials to help me.

I finally got it working by creating an A-record and a [page rule](https://www.cloudflare.com/features-page-rules/).

## Create a DNS record

If you don't have an A-record, I didn't, then create a dummy A-record in your domain's DNS. Set its name to `www` and the IPv4 address to `192.0.2.1`. Make sure that it's proxied (the orange cloud). The page rule we are going to create will run before this record is resolved so the value shouldn't matter, but the page rule won't run if we don't have this record.

## Page rule

1. Go to page rules (Rules > Page Rules)
1. Create a new rule. Set the first field, "if the URL matches", to `www.mydomain.com/*`. The asterisk will help us match any routes in the destination URL.
1. Select "Forwarding URL" and "301 - Permanent Redirect"
1. Set the destination URL to `https://mydomain.com/$1`

The asterisk combined with the `$1` will match and keep any routes. For example, `www.mydomain.com/sub/path` will redirect to `mydomain.com/sub/path`. If we don't include this part we would be redirected to the root, i.e. `www.mydomain.com/sub/path` would redirect to `mydomain.com`.
