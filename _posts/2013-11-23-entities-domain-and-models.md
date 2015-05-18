---
layout: post
title: Domain objects and code organization
meta: More elaborate answer on code and bundles arrangement
---

A few days – or was it weeks – ago, I answered hastily to [a question](https://groups.google.com/forum/#!topic/symfony2/tPjJ6UF_oZk) on the Symfony2 Google Group. The question is simple but the answer is not : How do your organise your code in a Symfony project?

I've had some time to think about it and wanted to elaborate on the subject. Writing makes me think, and thinking is good.

Everyone has their own way to do this. Some organize their code in a way that makes them faster – like in the [RAD edition](http://rad.knplabs.com). Some others take the time and put the emphasis on making things isolated, modular and re-usable. Most of us fall somewhere in the middle, still trying to find the structure that suits us, our workflow or our organization the most.

My original answer to the question was to keep the domain logic separate from the bundle code, i.e. place it in a re-usable library. The reason is that your business logic should be encapsulated into models, outside of persistance concerns, logging and all that jive that comes with writing bundles.

In his book [A year with Symfony](https://leanpub.com/a-year-with-symfony), Matthias Noback dedicated a whole section, 5 chapters, on how to be a good Symfony developper. What resonated the most with me in these chapters was to rely **less** on the structure provided by the framework to write your business logic. The framework is the glue that holds everything together in a – mostly – elegant way. It's not the end-all be-all of your application.

If in a couple of years you decide that this framework doesn't fit your business case anymore, you take your marbles – or libraries – and you play somewhere else. It's as simple as that.

## My own evolution

When I started working with Symfony, 2 years ago, I had a serious distaste for annotations and rapidly fell in love with the simplicity of yaml. I wrote schemas in yaml and generated the code for my entities using the Doctrine console commands. 

Now I realize how fast the code gets mixed-up with that workflow. The persistance logic is defined in your yaml schemas and the behaviour is defined in the entities. It seems like everything is isolated right? Where do the persistance callbacks are written in this scenario? Ah yeah ... in the entities with your business logic, and that sucks.

If you were to move those entities outside of your Symfony project, let's say you wanted to write another app in another framework from the same business domain, you'd find yourself stuck with a lot of extra code you don't really need. Moreover, you'd have no clean way of extracting the business models from your bundle – copy paste anyone? If some business rule change, can you still make the change in only one place? Yeah, that's what I thought.

My answer to that, and that might change again in the future, is to write your business logic in a library. Define your models there and then in your bundles you define entities that extend those base models.

Let's write a bit of code to illustrate that. First the model :

```php
<?php

namespace Acme\DomainLib\Model;

class Customer
{
    private $name;
    private $lastname;
    private $balance;

    public function payBalance($money)
    {
        // business logic
    }
}
```

And then the entity :

```php
<?php

namespace Acme\AppBundle\Entity;

use Acme\DomainLib\Model\Customer as BaseCustomer;
use Doctrine\ORM\Mapping AS ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="customers")
 */
class Customer extends BaseCustomer
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
     private $id;

    /**
     * @ORM\Column(type="string")
     */
    private $name;

    // ...
}
```

So, the code for the entities is pretty simple and all related to persistance, yay! Basically, we defined in our entity how our model should be stored and thats it. The business logic stays in the model, and the persistance logic stays in the entity.

We were also able to add an id attribute, which we don't really care about in our business domain, but do care about when dealing with databases and persistance. That's a nice separation of concerns right there.

## Re-usability

Now it's easy to keep my business logic in a separate git repository and add it as a dependency to my project(s).

If the business rules change – and gosh you know they do –, we make the change in the library code and update our projects dependencies.

Now if I want to use Laravel for a sub-system, I can. If I want to use Silex for an internal API, I can.

