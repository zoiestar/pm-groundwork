# Attribution

The `no-ai-slop` skill in this directory (`SKILL.md` and `eval.md`) is **not original to PM Groundwork**. It is vendored from:

**no-ai-slop** by Peter Yang ([@petergyang](https://github.com/petergyang))
https://github.com/petergyang/no-ai-slop
Licensed MIT.

## Why it's bundled

PM Groundwork's `pm-draft` skill runs it in detect mode as a quality gate before any generated document is considered finished. Bundling it means the gate works for every user out of the box rather than depending on them having installed it separately.

## Changes made

None. `SKILL.md` and `eval.md` are vendored as-is. If that changes, the modifications will be listed here.

## Note for users who already have it

If you have `no-ai-slop` installed separately, you now have two copies and skill routing may be ambiguous. Either is fine to use — they are the same skill. To remove the bundled copy, delete this directory; `pm-draft` will fall back to whichever copy your environment resolves.

## License

```
MIT License

Copyright (c) Peter Yang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
