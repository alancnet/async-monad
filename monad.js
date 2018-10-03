const monad = config => (...args) => {
    const resolve = val => (val && val.then)
        ? val
        : {then: fn => resolve(fn(val)), __stepStub: true, __stepValue: val}

    const withState = state => {
        const step = {}
        let then = null
        for (let key in config) {
            switch (key) {
                case 'init': continue
                case 'then': then = config.then; continue
            }

            step[key] = (fn => (...args) => {
                return withState(
                    state.then(
                        oldState =>
                            resolve(fn(oldState, ...args))
                            .then(newState => newState === undefined ? state : newState)
                    )
                )
            })(config[key])
        }

        if (Array.isArray(config.flags)) {
            config.flags.forEach(flag => {
                Object.defineProperty(step, flag, {
                    get: () => {
                        return withState(state.then(oldState => {
                            const newState = Object.create(oldState)
                            newState[flag] = (oldState[flag] || 0) + 1
                            newState.flags = [...(oldState.flags || []), flag]
                            return newState
                        }))
                    }
                })
            })
        }

        step.then = (resolved, rejected, final) => state.then(finalState => resolve(then ? then(finalState) : finalState)).then(resolved, rejected, final)
        step.catch = (rejected, final) => step.then(null, rejected, final)
        step.finally = (final) => step.then(null, null, final)
        step.valueOf = () => state.__stepStub ? state.__stepValue : monad.Promise.resolve(state)
        return step
    }

    return withState(resolve(
       config.init
       ? config.init(...args)
       : args.length === 1
       ? args[0]
       : args.length
       ? args
       : {}
    ))
}

monad.Promise = Promise
module.exports = monad