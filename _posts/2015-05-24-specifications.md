---
layout: post
title: 'Design Pattern: Specification'
---

The specification pattern is a software design pattern used to codify business rules that state something about an object. These simple predicates determine if an object's state satisfies a certain business criteria. They can then be combined to form [composite specifications](https://en.wikipedia.org/wiki/Specification_pattern) using logical operators.

Use a specification to encapsulate a business rule which does not belong inside entities or value objects, but is applied to them. Use them to:

1. make assertions (validation) about an object;
2. fetch objects matching certain criteria from a collection (selection);
3. specify how an object should be created (building to order).

As you'll soon realize, specifications are cheap to write, easy to test and can be combined to represent very complex business rules.


## Examples of specifications

- **InvoiceIsOverdue** if it isn't paid by the assigned date
- **CustomerIsPremium** if he has >= 3 orders
- **EmployeeIsDevelopper** if his job title is "developer"
- **EmployeeHasLowSalary** if his salary is < 35000$

These rules can be really powerful for reports and data analysis. A nice plus is that you can change the logic in a single place when the business rule evolves, e.g. >= 5 orders for premium rates instead of 3.

It also has the advantage of making a business rule explicit in the codebase, instead of burying this logic in a procedure or an utility class. This business rule becomes a first-class citizen of your codebase.


## Writing a simple spec: CustomerIsPremium

In our project, we will have more than one specification for customers, so let's first define an interface that all our customer specifications will have to implement.

```php
<?php

interface CustomerSpecification
{
    /** @return bool */
    public function isSatisfiedBy(Customer $customer);
}
```

This contract defines a single method that our specs must implement: `isSatisfiedBy()`. The method takes a `Customer` object parameter and returns a `bool`, wether or not the rule is satisfied by the customer object.

Then, we can take the *customer is premium* logic and encapsulate it in an explicitely named specification.

```php
<?php

final class CustomerIsPremium implements CustomerSpecification
{
    private $orderRepository;

    public function __construct(OrderRepositoryInterface $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    /** @return bool */
    public function isSatisfiedBy(Customer $customer)
    {
        return $this->orderRepository->countFor($customer) > 3;
    }
}
```

Since this business rule relies on how many orders this customer has, we have to inject the `OrderRepository` in its constructor. During unit tests, we can easily swap this repository for a mock and test our specification in isolation.

You can then use it to make assertions on a customer object.

```php
<?php

// ...

$customer = $customerRepository->findById(42);

$spec = new CustomerIsPremium($orderRepository);
$spec->isSatisfiedBy($customer); // true/false
```


## Composite specs

We can step it up a notch and write a composite specification using the *and* boolean operator. We'll then be able to combine multiple specifications that'll have to be satisfied by the customer object.

We'll create an abstract class that our specifications will have to extend. It will contain methods to compose specifications like `andSpecification()`, `orSpecification()` and `notSpecification()`. Here's for the `andSpecification()`.

```php
<?php

abstract class AbstractSpecification
{
    /**
     * @param AbstractSpecification $other
     *
     * @return AndSpecification
     */
    public function andSpecification(AbstractSpecification $other)
    {
        return new AndSpecification($this, $other);
    }
}
```

```php
<?php

final class AndSpecification extends AbstractSpecification implements SpecificationInterface
{
    /** @var AbstractSpecification */
    private $one;

    /** @var AbstractSpecification */
    private $two;

    /**
     * @param AbstractSpecification $one
     * @param AbstractSpecification $two
     */
    public function __construct(AbstractSpecification $one, AbstractSpecification $two)
    {
        $this->one = $one;
        $this->two = $two;
    }

    /**
     * @param mixed $object
     *
     * @return bool
     */
    public function isSatisfiedBy($object)
    {
        return $this->one->isSatisfiedBy($object) && $this->two->isSatisfiedBy($object);
    }
}
```

It's really simple, yet powerful and explicit. You can now combine specifications to make assertions on an object:

```php
<?php

// ...

$spec = new AndSpecification(
    new CustomerIsPremium($orderRepository),
    new CustomerHasOverdueInvoices($invoiceRepository)
);

$spec->isSatisfiedBy($customer); // true/false
```

## Fetching objects with a spec

The second use case is to use specifications to select objects matching certain criteria from a collection, like an entity repository.

```php
<?php

interface RepositoryInterface
{
    public function selectSatisfying(SpecificationInterface $specification);
}
```

The collection will test against the objects it contains and return the set that satisfies the specification.

I hear you, what about performance? It's true that if you have to fetch all 16 gazillion customers from storage, and loop over all of them to see which one satifies the spec, the performance will suck ... bad.

A compromise would be to encapsulate some SQL inside the specification. Yes, your domain object will become *tainted* with infrastructure concerns, but sometimes, pragmatism beats purity.

```php
<?php

interface SqlSpecification
{
    /** @return string */
    public function asSql();
}
```

```php
<?php

final class CustomerIsPremium implements CustomerSpecification, SqlSpecification
{
    // ...

    /** @return string */
    public function asSql()
    {
        return "SELECT * FROM customers LEFT JOIN orders ON ...";
    }
}
```

This can become problematic really fast, because database structure has leaked into the domain. Any change to the database will have to be reflected in a bunch of specifications and as you know, a class should [have only one reason to change](http://williamdurand.fr/2013/07/30/from-stupid-to-solid-code/#single-responsibility-principle).

You could use inversion of control to, at least, keep all that SQL inside the repository, which wouldn't be half as bad. You could also use an ORM, like [Doctrine](http://www.doctrine-project.org/), and use its mapping layer to decouple your code from the infrastructure layer.

It depends on your project, your team and it's up to you to decide where you draw the line.


## Building to order

The third use case for specifications is building objects to specification. You can use them to tell a factory how to create an object satisfiying certain criteria. 

The code gets a bit more complicated and won't be discussed here. There's a whole chapter dedicated to specifications in Eric Evans' book, so you can read chapter nine if you're interested in learning more.


## References

- Evans, Eric (2004). [Domain Driven Design](http://www.amazon.com/gp/product/B00794TAUG/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00794TAUG&linkCode=as2&tag=marcaube-20&linkId=CH3BZ3D5JG6K4RZ3). Addison-Wesley.
- Carlos Buenosvinos, Christian Soronellas and Keyvan Akbary. (2015). [Domain-Driven Design in PHP](https://leanpub.com/ddd-in-php?a=Ug88MJbcykCAu8AEAWNjDA). Leanpub.

## Links

- [Specifications (pdf)](http://www.martinfowler.com/apsupp/spec.pdf) by Eric Evans and Martin Fowler
- [The Specification Pattern: A Primer](https://matt.berther.io/2005/03/25/the-specification-pattern-a-primer/) by Matt Berther
