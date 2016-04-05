---
layout: post
title: Quick bash tips
description: Just two simple bash tips that I picked up today; how to escape a frozen SSH session, and how to sequentially call a list of URLs.
---

## Escape a frozen SSH session

Quite often, I'm working on a project and running commands on the remote server via SSH. Also quite often, I'll step away from the keyboard long enough or execute an `ls` in a folder with a stale NFS mount and my SSH session will freeze. My usual solution to get myself out of this situation is to kill my whole terminal and start over.

What I learned today, after searching for all of 2 minutes to find a solution to my recurring problem, is that there a sequence of key you can type to exit the SSH session: `enter` `~` `.`.

> You need to send the ssh escape sequence, which by default is `~` at the beginning of a line (in other words, preceded by a newline, or `enter`). Then send the disconnect character, which is `.`. – http://unix.stackexchange.com/a/78272

As was pointed out by [@xerkus](https://twitter.com/xerkus/status/717418936787144705) on twitter, I just never bothered to read the man page for SSH, especially the section on the escape character:

> -e escape_char
Sets the escape character for sessions with a pty (default: ‘~’). The escape character is only recognized at the beginning of a line. The escape character followed by a dot (‘.’) closes the connection; followed by control-Z suspends the connection; and followed by itself sends the escape character once. Setting the character to “none” disables any escapes and makes the session fully transparent.


## Sequentially call a list of URLs

This afternoon, one of my colleagues had a list of 200+ URLs to call in a sequence. His list was an HTML file with 200 links that he planned to click one by one. A quick Google search and 2 minutes of reading, we had a one-line [solution](http://linux.byexamples.com/archives/125/curl-multiple-urls/).

First create a file with the plaintext list, then the URLs need to be between quotes...

```bash
awk '{ print "\""$0"\""}' urls.txt > quoted-urls.txt
```

Then we can use curl to call the list line by line...

```bash
xargs curl -I < quoted-urls.txt
```

This command will call the URLs (one per line) in `quoted-urls.txt` and display the response headers for each. We had to tweak it a little bit to send the `Cookie` header, because the URLs were in the admin section of the website.

```bash
xargs curl -H 'Cookie: session=9ao4g0ci2h8eiovlknspv63ku4;' -I < quoted-urls.txt
```
