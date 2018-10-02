const monad = require('../monad')

describe('Synchronous Monad', () => {
    let callCount
    let myMonad = monad({
        init: v => ({
            init: v
        }),
        a: state => {
            state.a = true,
            callCount.a++
        },
        then: state => {
            callCount.then++
            return state
        }
    })
    beforeEach(() => {
        callCount = {
            a: 0,
            b: 0,
            c: 0,
            then: 0
        }
    })

    it('should not execute code until .then is called', async () => {
        expect(callCount.a).toBe(0)
        let m = myMonad('initial').a()
        expect(callCount.then).toBe(0)
        await m
        expect(callCount.a).toBe(1)
        expect(callCount.then).toBe(1)
    })
})

describe('Asynchronous Monad', () => {
    let callCount
    let myMonad = monad({
        init: async v => ({
            init: v
        }),
        a: async state => {
            state.a = true,
            callCount.a++
        },
        then: async state => {
            callCount.then++
            return state
        }
    })
    beforeEach(() => {
        callCount = {
            a: 0,
            b: 0,
            c: 0,
            then: 0
        }
    })

    it('should not execute code until .then is called', async () => {
        expect(callCount.a).toBe(0)
        let m = myMonad().a()
        expect(callCount.then).toBe(0)
        await m
        expect(callCount.a).toBe(1)
        expect(callCount.then).toBe(1)
    })
})

describe('Simple Monad', () => {
    let callCount
    let myMonad = monad({
        a: async state => {
            state.a = true,
            callCount.a++
        },
    })
    beforeEach(() => {
        callCount = {
            a: 0,
            b: 0,
            c: 0
        }
    })

    it('should not execute code until .then is called', async () => {
        expect(callCount.a).toBe(0)
        let m = myMonad().a()
        await m
        expect(callCount.a).toBe(1)
    })
})

describe('Flags', () => {
    let myMonad = monad({
        flags: ['a', 'b', 'c']
    })

    it('should collect flags requested', async () => {
        const a = await myMonad().a.b.c.b.b.a

        expect(a.a).toBe(2)
        expect(a.b).toBe(3)
        expect(a.c).toBe(1)
        expect(a.flags).toEqual(['a','b','c','b','b','a'])
    })
})

describe('Simple Monad', () => {
    it('should work', async () => {
        const myMonad = monad({
            square: x => x * x,
            cube: x => x * x * x,
            negate: x => -x,
        })

        const val = await myMonad(2).square().cube().negate()
        expect(val).toEqual(-64)
    })
    it('should work async', async () => {
        const myMonad = monad({
            square: async x => x * x,
            cube: async x => x * x * x,
            negate: async x => -x,
        })

        const val = await myMonad(2).square().cube().negate()
        expect(val).toEqual(-64)
    })
    it('should work with changing state', async () => {
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
    })
})

