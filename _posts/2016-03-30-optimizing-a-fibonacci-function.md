---
layout: post
title: Optimizing a fibonacci function
---

A couple of days ago, one of my colleague was talking about a time when he was interviewed, and had to solve a bunch of programming puzzles. I like to solve puzzles, even if I don't think that [they're good interview questions](https://zachholman.com/posts/startup-interviewing-is-fucked/) ([cache](/cache/fbac56b711bcf388ec43bfb29b934e29.html)).

These kind of code challenge tend to favour people with a CS background, and most of the time have nothing to do with the job the company is interviewing for.

The 14 lines of code he had to optimize during the interview are pretty easy to understand, but the solution – or one of the solutions – is not evident at first.

```js
var yourself = {
    fibonacci : function(n) {
        if (n === 0) {
            return 0;
        }
        if (n === 1) {
            return 1;
        }
        else {
            return this.fibonacci(n - 1) +
                this.fibonacci(n - 2);
        }
    }
};
```

When you run that code sample on [Codility](https://codility.com/programmers/), you get a short message explaining the rules of the game: speed optimization.

> Correct value, but the execution takes too long. Improve it!

There's a couple of easy picks that caught my eyes at first, but they fall into the cosmetic or micro-optimisation category.


## 1. the else is not needed

It's mostly a cosmetic change, but it's something to get us started. This code can do without the else, since there are two exit conditions just before. You'll only get to that code if *n* bigger than 1.

```js
var yourself = {
    fibonacci : function(n) {
        if (n === 0) {
            return 0;
        }
        if (n === 1) {
            return 1;
        }

        return this.fibonacci(n - 1) +
            this.fibonacci(n - 2);
    }
};
```

Let's run that...

> Correct value, but the execution takes too long. Improve it!

Well, I didn't expect this to be *that* easy, but the code is a bit more readable already, and that counts for something, right?


## 2. you can combine the exit conditions

This refactoring is similar to #1. The two ifs are redundant, because for *n* <= 1, the function returns *n*.

```js
var yourself = {
    fibonacci : function(n) {
        if (n <= 1) {
            return n;
        }

        return this.fibonacci(n - 1) +
            this.fibonacci(n - 2);
    }
};
```

I don't think that's what they're after, but let's run that again...

> Correct value, but the execution takes too long. Improve it!


## 3. too many recursive calls

When you look at what's left of the code, you see that for each value of *n*, you'll make two recursive calls. When *n* grows, the number of function calls grows exponentially.

Also, the same values will be computed over and over, because `this.fibonacci(n - 1)` will then calculate `this.fibonacci(n - 2)`, and `this.fibonacci(n - 3)`, and so on until the value of *n* reaches 0.

The execution of this function goes like this:

```
f(5)
f(4) + f(3)
f(3) + f(2) + f(2) + f(1)
f(2) + f(1) + f(1) + f(0) + f(1) + f(0) + 1
f(1) + f(0) + 1 + 1 + 0 + 1 + 0 + 1
1 + 0 + 1 + 1 + 0 + 1 + 0 + 1

return 5
```

In many languages, the sum operations are deferred until the interpreter reaches the end of the call stack. This means that all the numbers are kept memory until a final value can be returned.

You could illustrate the computational complexity of this function using the [Big O notation](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/) ([cache](/cache/11cba2cc5d0e7aa956eb5f7d346c859a.html)), and you'd get something like **O(2<sup>n</sup>)**. This is bad, *really* bad... but we can improve on that!

What if you could make only one recursive call for each *n*? That would be awesome, because that would get us down to **O(n)**. To manage that, we'll need to use an accumulator.

```js
var yourself = {
    fibonacci : function(n) {
        if (n <= 1) {
            return n;
        }

        return this.fibonacci_acc(n, 1, 0);
    },
    
    fibonacci_acc : function (n, prev, acc) {
        if (n <= 0) {
            return acc;
        }
         
        return this.fibonacci_acc(n - 1, acc, prev + acc);
    }
};
```

The first thing to notice, is that the `+` operation is not deferred until the end anymore, it is done immediatly, and passed as a parameter to the recursive function. `acc` is our accumulator.

The role of this accumulator is to accumulate (orly?) the result of the fibonacci function at every call. `prev` is used to store the previous value of the accumularor, since the result of the fibonacci(n) is based on the result of fibonacci(n - 1) and fibonacci(n - 2).

If you trace the execution of `fibonacci_acc` for *n* = 5, this is what the values of each parameters look like:

| n | prev | acc |
|:---:|:---:|:---:|
| 5 | 1 | 0 |
| 4 | 0 | 1 |
| 3 | 1 | 1 |
| 2 | 1 | 2 |
| 1 | 2 | 3 |
| 0 | 3 | 5 |

And if we run that one we get...

> Great! Brag about your success and get updates from us ...


## 4. What now?

It works, but there's another solution in there if you look closely. We can now get rid of the recursion alogether using a simple *while* loop. You basically want to reproduce what you had in the table:

While *n* is bigger than 0...

- store the value of the accumulator in `prev`
- increment the accumulator with `prev`
- decrement n

You'll need to introduce a temporary variable to do so:

```js
var yourself = {
    fibonacci : function(n) {
        var prev = 1, acc = 0, tmp;
        
        while (n > 0) {
            tmp = prev;
            prev = acc;
            acc = tmp + acc;
            n--;
        }
        
        return acc;
    }
};
```

If you run this iterative version, you still get the success message:

> Great! Brag about your success and get updates from us ...


## 5. Conclusion

That was a fun little challenge, and we ended up with two ways to optimize the initial code. Which solution is better is a matter of taste, and I'd stick with the one that is the most idiomatic to you and your colleagues.

You could probably benchmark the two solutions, and surely one would prove to be slightly better than the other, if you care about those few microseconds.

In the context of web development, that was a rather academic exercise and I don't see the point in using that kind of problems as interview questions. To each his own I guess...
