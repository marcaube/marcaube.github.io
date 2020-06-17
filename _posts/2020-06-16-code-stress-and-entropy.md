---
layout: post
title: "Code, stress and entropy"
image: peter-nguyen-fsgyO8vF7do-unsplash.jpg
description: "Musings about the parallels between computer systems, physics, and biology to understand how we can make our systems better."
canonical: https://medium.com/poka-techblog/code-stress-and-entropy-920c8880744d
---

_This is a repost of a piece I wrote [on Medium](https://medium.com/poka-techblog/code-stress-and-entropy-920c8880744d).

## Code as a living thing

To me, one of the most fascinating things in software development is the organic properties of code. If you zoom out to get a 10,000ft view of a large codebase and watch the changes over time, it will almost look alive. Some parts of it will grow and contract, some other parts will calcify and stop changing altogether.

Like a living organism, the codebase responds to stress by changing and adapting. Stress, for a codebase, can be changing requirements, new business rules or regulations, new team members, the addition of new features… you get the gist. Like their living counterparts, some systems are going to be better adapted to that changing environment, and some won't.


## Sliding towards chaos

A hidden source of stress is entropy, which can be defined as the gradual decline into disorder. Left unchecked, this chaotic force will slowly attack your projects and blur the conceptual lines. Without clear architectural guidelines, code will be shaped by ever-changing teams, competing methodologies and your project will slowly turn into the dreaded ["big ball of mud"](https://en.wikipedia.org/wiki/Big_ball_of_mud).

Counter-intuitively, a feature-complete project is not exempt from this phenomenon. Even if nothing is committed to your codebase, the world continues to move on. Third-party libraries change, new security vulnerabilities are found, the underlying operating system evolves, and your software project is slowly left behind. The next time you push a change to your repository, you may find out with horror that your deployment pipeline doesn't work anymore, or that you are running on an unsupported version of your framework and most libraries no longer support it.

This disorder increases over time. Therefore, time is one of the major forces that will apply stress to your codebase. This slow deterioration of software over time is often referred to as ["code rot", or "software rot"](https://en.wikipedia.org/wiki/Software_rot). Your software itself does not decay, but it becomes less and less adapted to its environment, like a living organism that does not develop new mechanisms to cope with outside stress.

All of this sounds bad, but stress can also be a good thing.

---


## Anti-fragility: Gaining from disorder

> Some things benefit from shocks; they thrive and grow when exposed to volatility, randomness, disorder, and stressors and love adventure, risk, and uncertainty.

In his book _Anti-Fragile_, Nassim Nicholas Taleb classifies things in three buckets: fragile, robust and anti-fragile. In a best-case scenario, something fragile will stay unchanged. In a worst-case scenario, it will break. Something robust will stay as-is regardless of what happens, nothing gained, nothing lost. The last bucket is the one that is most interesting to me. The anti-fragile system will remain unchanged in the worst-case scenario, but improve when subjected to stressors, volatility or exceptions.

A good example of an anti-fragile system is our skeleton or our muscles. If you repetitively apply controlled stress, in the form of running or lifting weights, your body will improve. Your bones will get denser from the loading, your muscles will get bigger and stronger, your cardiovascular system will get more efficient at delivering oxygen where it's needed. Your body slowly adapts to outside stress over time.


## Shedding unused adaptations

There's an inherent cost to all those adaptations, whether your currency is money invested in your architecture, or calories consumed. Unless subjected to those stressors regularly, your system will slowly get rid of those adaptations.

Our bodies have evolved over thousands of years with one major goal in mind: survival. It will let go of the extra muscle mass if it's not _absolutely_ required for your survival, because there's an energy cost to keeping it around for nothing. Your body will optimize it away, unless you keep moving, jumping, balancing and lifting. Keeping unnecessary, energy-consuming adaptations is not a good survival strategy.

The same thing should be true for the code we write. Each pieces of a complex system should have to fight for its existence, and be disposed of when it's not bringing enough value for what it costs. Sadly, this is often not the case. As a system is modified, its complexity generally increases, unless your team actively works against it.

The process of code refactoring can go a long way to reduce complexity and keep software entropy in check. Simplifying functions, extracting common logic, removing dead code.

Taking care of a codebase is often like tending to a garden: a little attention here and there, over time, goes a long way into keeping things orderly.


## Keeping the desired adaptations

> […] if antifragility is the property of all those natural (and complex) systems that have survived, depriving these systems of volatility, randomness, and stressors will harm them.

What if you _do_ want to keep those hard-earned adaptations?

Automated tests are a stressor we have in our arsenal that can help us improve and shape our systems. Either at the micro-level with unit tests, or the macro-level with system experiments, such as terminating a service instance to see how your system reacts. Software testing is a fractal, the same principles apply at every magnification level.

First, you start with a hypothesis, like "this function should react this way when receiving this input", or "a new database read-replica should spin up when the load gets over this level". Then you subject your code or your system to it, and make different assertions about the results. [Chaos engineering](http://principlesofchaos.org/), popularized by Netflix, is not that different from the kind of testing you are used to, it's only happening at a different conceptual level.

---

If there's one thing that I want you to remember from my musing about code, physics, and biology, it's that **you have to be deliberate about the pressures that you apply to your systems** if you want them to develop and maintain the qualities that you are after.

If you want your swarm of micro-services to be resilient to failures, try shutting some of them down, see how the whole reacts and make adjustments. If you want your system to be secure, subject it to regular pentests and code audits. **Slowly push it towards the properties that you want it to have.**

As developers, we've never been more equipped to build nimble, adaptable and anti-fragile systems._
