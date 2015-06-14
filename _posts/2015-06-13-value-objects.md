---
layout: post
title: Value Objects
---

Value objects are an important building block of domain-driven design. They are *small* objects that encapsulate value, validation and behaviour. You can use them to group related values together and provide functionality related to what they represent.

> A small simple object, like money or a date range, whose equality isn't based on identity.
> – Martin Fowler

Value objects equality is not based on identity. Two `PhoneNumber` objects are equal if they represent the same phone number, even if they are not the same object reference. An often used example is comparing bank notes: a 5$ bill is the same as another 5$ bill. You don't care which one you get, you're only interested in its value.

Most importantly, value objects should be immutable, which mean they **shouldn't** have any mutators (*setters*). If you want to change it, simply replace the whole object with a new one. This will prevent a lot of nasty side-effects.


## Examples of value objects

Here are some common use cases for value objects:

- Email address
- Money
- Measurement (distance, surface, weight, concentration, etc.)
- Geo coordinate
- Date range
- Address
- Postal/zip code
- Province/State
- Person name
- Status
- UUID


## Attributes


### Immutable

> A general heuristic is that value objects should be entirely immutable
> – Martin Fowler

Once created, a value object should not change. This makes them easy to understand and completely side-effect free. All the required parameters are passed to the object's constructor or a static factory method, the object is created in a single step.

```php
<?php

// Normal constructor
$lotDimension = new Surface($width, $length);

// Static factory methods
$lotDimension = Surface::fromMetric($width, $length);
$lotDimension = Surface::fromImperial($width, $length);
```


### Encapsulate validation

Validations and guard clauses ensure the input values are valid during the object creation.

You can then rely on the fact that, when you use an `Email` object in a piece of code, it has a valid format and all. Simply put, a value object is responsible for the consistency of its internal data: it cannot be created with, or mutated to an invalid state.

```php
<?php

final class Email
{
    // ...
    
    public function __construct($email)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException();
        }
        
        $this->email = $email;
    }
}
```


### Group related values

While modelling your business problem, you often come across values that only make sense together:

- Amount and currency (Money)
- Latitude and longitude (Geo coordinate)
- Door number, street name, city, postal/zip code (Address)
- Amount and unit (measurement: distance, weight, etc.)

It would be dangerous to pass around an `int` (or worse a `float`) representing an amount of money, and a `string` for the currency. Chances are high that one of them will get mixed up at one point or another.

Value object can also contain other value objects. For instance, an address contains a zip code, which is a string with a particular format, so it would be a distinct value object.

*Just be careful not to reference an entity from a value object. Entities are mutable and could cause unexpected side-effects.*

Look in your domain and you'll find multiple values that tend to stick together and form a conceptual whole. Group them in a value object.


### Provide behaviour

Take a `PhoneNumber`, there are use cases where you'd want to retrieve the country code, or the regional code. The object could expose methods to get those values.

Behaviour can also be more elaborate than simple accessors. A `Distance` object could expose methods to express its value in miles or kilometres. A `DateTimeInterval` could provide methods to express the interval in days, weeks or months. I'm sure you get the idea.

Look in your code for services and utility classes that you use to manipulate data. If that data is an important concept in your domain, it may be an opportunity for a value object. Make the concept explicit and encapsulate the behaviour within intention revealing methods.


### Avoid primitive obsession

> If I had a dime for every time I've seen someone use FLOAT to store currency, I'd have $999.997634
> -- Bill Karwin

[Primitive Obsession](http://c2.com/cgi/wiki?PrimitiveObsession) is an anti-pattern where primitive types (`int`, `string`, `array`) are used to represent domain concepts. For example, using a `string` to represent an email address, using a `int` or `float` to represent an amount of money, using an `array` to represent a collection of data.

When these primitive types are passed around in your code, they carry no intrinsic meaning, you don't know what they represent apart from what the variable/parameter name tells you. It's up to the developer to figure it out.

You also have to make sure that these values are valid. If an email is passed around as a string, you'll need email validations all over the place. That wouldn't be DRY.

To cure your codebase of primitive obsession, you should introduce value objects to replace those primitive data types. If your function requires an `Email` VO instead of a string, you can be sure it is valid. If it requires a `Money` VO instead of a `float` for the amount and a `string` for the currency, you can be sure that the currency won't be changed accidentally (remember, 1 Euro != 1 USD).

```php
<?php

interface EmailService
{
    // No need for email validations, we type-hint with the value object.
    public function sendEmail(Email $to, Email $from, $message);
}
```


## References

- Evans, Eric (2004). [Domain Driven Design](http://www.amazon.com/gp/product/B00794TAUG/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00794TAUG&linkCode=as2&tag=marcaube-20&linkId=CH3BZ3D5JG6K4RZ3). Addison-Wesley.
- Vernon, Vaughn (2013). [Implementing Domain-Driven Design](http://www.amazon.com/gp/product/0321834577/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0321834577&linkCode=as2&tag=marcaube-20&linkId=MPKTTHW5Q4KNGDSJ). Addison-Wesley.
- Carlos Buenosvinos, Christian Soronellas and Keyvan Akbary. (2015). [Domain-Driven Design in PHP](https://leanpub.com/ddd-in-php?a=Ug88MJbcykCAu8AEAWNjDA). Leanpub.
- Avram, Abel (2007). [Domain Driven Design Quickly](http://www.amazon.com/gp/product/1411609255/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1411609255&linkCode=as2&tag=marcaube-20&linkId=GSNP6SVHXM4ZUFPW) ([free pdf]((http://www.infoq.com/minibooks/domain-driven-design-quickly))). Lulu.


## Links

- [Value Object](http://c2.com/cgi/wiki?ValueObject) by Ward Cunningham
- [Value Object](http://martinfowler.com/eaaCatalog/valueObject.html) by Martin Fowler
- [The Heart and Soul of OOP](http://elephantintheroom.io/blog/2013/10/episode-2-heart-and-soul-of-oop/) in the Elephant in the Room podcast
