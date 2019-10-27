---
layout: post
title: Hunting Mutants with Mutmut
image: hunting-mutants-with-mutmut.jpg
description: "There are many reasons why you might want to write tests for your code: to prove it works as expected, to prevent bugs from coming back..."
canonical: https://medium.com/poka-techblog/hunting-mutants-with-mutmut-5f575b625598
---

_This is a repost of a piece I wrote [on Medium](https://medium.com/poka-techblog/hunting-mutants-with-mutmut-5f575b625598)._

There are many reasons why you might want to write tests for your code: to prove it works as expected, to prevent bugs from coming back after you fix them, or simply to shorten the feedback loop between the moment you type in your editor to the moment you run your new piece of code.

The nice thing about automated tests is that they are repeatable, and scale really well. Whether it's Monday morning or Friday afternoon, whether you are distracted or deeply focused, whether they're executed by the most senior or the most junior member of your team, they'll always produce the same results.

They're just as good and valuable as you make them.


## The code coverage fallacy

To get a measure of the quality of your test suite, you might track metrics like code coverage. Code coverage enables you to measure what parts of your code are exercised by tests. You can visualize parts that need more attention, and parts that are well covered.

A limitation of code coverage though, is that it has no way of knowing how well your code was exercised: it knows that a particular method was executed, but not why. Take this example:

```python
def increment(x):
    return x + 1

def test_increment():
    increment(3)
    assert True
```

If you execute this code with pytest and generate coverage with pytest-cov, it will report 100% code coverage, even though we didn't assert anything useful about the code.

```bash
$ pytest --cov=. mumut_snippet_1.py

---------- coverage: ...     -----------
Name                 Stmts   Miss  Cover
----------------------------------------
mutmut_snippet_1.py      5      0   100%
```

Admittedly, this example is a bit silly and is not likely something that would pass through even the lightest code review process. Take this other example:

```python
def increment(x):
    return x + 1

def test_increment():
    assert 3 < increment(3)
```

While it's more useful than the last test and really does assert an important property of our code, this test could be improved. On this contrived example, it's easy to spot how to make it better. On a more complicated test, it can be hard to spot the flaws.

The point I'm trying to make here is that code coverage can be tricked, intentionally or not, and may not be as good a measure of code quality as you think it is. When you mix complex requirements, complex code and complex tests together, you are bound to have the same kind of shortcomings somewhere in your tests.

Worse, a high code coverage may even give you a false sense of security. One Friday afternoon, a mission-critical piece of code breaks in a spectacular way just after a deploy, even though it was well tested and you had complete confidence in it. Based on the metrics, it was pretty much unbreakable!

I think you should instead view code coverage as a good way to know which part of the codebase is not tested enough and needs more attention, not as a way of knowing which part is really dependable.


## Mutation testing to the rescue!

I'm going to get a little meta and postulate the following argument: _code has bugs and tests are code, therefore tests have bugs too_. So then, who's watching the watchers? Your mutation testing tools of course!

In a nutshell, what mutation testing does is: run your test suite, inject small defects in your code, one by one, and check that your tests noticed. This style of automated testing can help you identify weaknesses in your existing tests. Boundaries that were not tested, missing checks, false assumptions, etc.

It goes without saying, it's going to be most effective on codebases with a high code coverage, and will complement your existing tests.


## What are mutations?

The tiny defects injected in the code are called mutations. When you run your test suite, you're trying to catch the mutant. If it goes unnoticed, the mutant escaped! When a test goes red, you killed the mutant.

There are many types of mutations: arithmetic, boolean, comparison, etc. It sounds a bit complicated at first, but it's really quite simple, and you don't have to do any of this yourself.

When the mutation testing tool sees a token in the _Original_ column, it will substitute it with the corresponding token in the _Mutated_ column. That'll make your code produce unexpected results, and that's what you want your tests to detect.

| Original | Mutated |
| :------: | :-----: |
| `+` | `-` |
| `-` | `+` |
| `*` | `/` |
| `/` | `*` |
| `%` | `*` |
| `**` | `/` |

There's a ton of other mutators, but you get the idea, there's no point in covering them all here.


## Using Mutmut

There are several mutation testing tools in Python, but let's use [Mutmut](https://pypi.org/project/mutmut/), just because it's dead-simple to get started with it.

```bash
$ pip install mutmut
```

And that's it! You can now run Mutmut from the command line to see just how good (or bad) your tests are. You can also configure a few things to make it work smoothly on bigger projects, just follow [the documentation](https://mutmut.readthedocs.io/).

Let's see the output for our second code sample:

```bash
$ mutmut mutmut_snippet_2.py

Running tests without mutations... Done
--- starting mutation ---
FAILED: mutmut mutmut_snippet_2.py --apply --mutation "    return x + 1⤑1"
```

Mutmut first runs the test suite to make sure every test passes, then starts injecting mutations in the code, and report everything that escapes the tests.

When it finds a mutant that escaped it outputs a line you can copy, everything after "FAILED:", and execute in your terminal. Mutmut will apply that mutation to your code so you can fiddle with your tests and hopefully kill the mutant. Don't forget to rollback that change in your source code!


## The workflow

The documented way to work with Mutmut goes like this:

1. Run mutmut on your project;
1. Apply a mutant to disk by copying and running the command from the output (the part after "FAILED:");
1. Update your tests or add a new test to catch the defect;
1. Rollback the mutant;
1. Rerun the tests to see that it now passes;
1. Go back to step 2 until you've killed all the mutants!


## Conclusion

As you may have realized in the last section, Mutmut has its limitations. The workflow is a bit convoluted and is perhaps the result of the tool being so simple. [More complex tools exist](https://github.com/sixty-north/cosmic-ray), but the mutation testing landscape just isn't as mature in Python as it is in other languages. Just take a look at [Infection](https://infection.github.io/guide/) in PHP, or [Mutant](https://github.com/mbj/mutant) in Ruby.

As the tools get better and easier to use, it's going to be possible to integrate them more tightly in your workflow. You'll be able to configure a nightly job in your CI, and read a report in the morning with metrics that are really tied to your tests effectiveness, e.g. "While your tests report 100% code coverage, mutants were killed in only 75% cases, meaning 25% of your coverage comes from tests that could be improved".

Nevertheless, I truly believe mutation testing is a useful methodology, and we should strive to improve the tooling so we can improve our tests!
