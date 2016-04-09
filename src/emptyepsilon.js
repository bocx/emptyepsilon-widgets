(() => {
    const watchers = {};

    function constructUrl(url, params) {
        return url +
            Object.keys(params).map(key =>
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            ).join('&');
    }

    window.EmptyEpsilon = {
        get: params =>
            fetch(constructUrl('/get.lua?', params))
            .then(_ => _.json()),

        set: params =>
            fetch(constructUrl('/set.lua?', params))
            .then(_ => _.json()),

        exec: body =>
            fetch('/exec.lua', {method: 'POST', body})
            .then(_ => _.json()),

        watch: expression => ({
            onValue: callback => {
                if (!watchers[expression]) {
                    watchers[expression] = [];
                }
                watchers[expression].push(callback);
            }
        })
    };

    setInterval(() => {
        const params = Object.keys(watchers).reduce(
            (params, expression, index) => Object.assign(params, {[`q${index}`]: expression}),
            {}
        );

        const result = EmptyEpsilon.get(params).then(data =>
            Object.keys(params).map(key => {
                const expression = params[key];
                const value = data[key];
                return {expression, value};
            })
        );
        result.then(result => {
            result.forEach(pair => {
                watchers[pair.expression].forEach(watcher => watcher(pair.value));
            });
        });
    }, 200);
})();
