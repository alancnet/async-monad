# async-monad

## Monads

Monads give you a fluent gramatical programming style, and even a domain specific language.
For example: expect(a).toBe(1). This library allows you to explore such tooling in a clean
and asynchronous way.

Monads are inheritly functional. They carry a state, but that state should be immutable.
That means the state is built up and transformed in each step. However if you want the steps
to modify original behavior, that is possible too by creating a step called `then` which
will always be called last.

### Examples:

#### Simple Monad:

```javascript
const monad = require('async-monad')

const myMonad = monad({
    square: x => x * x,
    cube: x => x * x * x,
    negate: x => -x
})

const val = await monad(2).square().cube().negate()
expect(val).toEqual(-64)
```

### Async Monad:

```javascript
const monad = require('async-monad')

const myMonad = monad({
    square: async x => x * x,
    cube: async x => x * x * x,
    negate: async x => -x
})

const val = await monad(2).square().cube().negate()
expect(val).toEqual(-64)
```

### Monad with state initializer and finalizer

```javascript
const monad = require('async-monad')

const myMonad = monad({
    init: (name) => ({
        name,
        hasBanana: false,
        hasBiscuit: false
    }),
    withBanana: state => ({...state, hasBanana: true}),
    withBiscuit: state => ({...state, hasBiscuit: true}),
    then: state => [
        [state.name, true],
        ['with banana', state.hasBanana],
        ['with biscuit', state.hasBiscuit]
    ].filter(x => x[1]).map(x => x[0]).join(' ')
})

const george = await myMonad('monkey').withBanana()
const leroy = await myMonad('bird').withBiscuit()
const billy = await myMonad('human').withBanana().withBiscuit()

expect(george).toBe('monkey with banana')
expect(leroy).toBe('bird with biscuit')
expect(billy).toBe('human with banana with biscuit')

```