module.exports = function (api) {
    api.cache(false)
    var config = {};
    debugger
    switch(process.env.type) {
        case "empty":
                return config
        case "env":
            config = {
                "presets": ["@babel/preset-env"]
            }
            return config
        case 'polyfill':
            config = {
                "presets": ["@babel/preset-env"],
                // "plugins": ["@babel/plugin-syntax-dynamic-import"]
            }
        case 'babelLoader':
            config = {
                "presets": ["@babel/preset-env"],
            }
        case 'babelRuntime':
            config = {
                "presets": ["@babel/preset-env"],
                "plugins": [
                    [
                        "@babel/plugin-transform-runtime",
                        {
                            "corejs": 3 
                        }
                    ]
                ]
            }
        case 'babelRegister':
            config = {
                "presets": ["@babel/preset-env"],
                // "plugins": [
                //     [
                //         "@babel/plugin-transform-runtime",
                //         {
                //             "corejs": 3 
                //         }
                //     ]
                // ]
            }
    }
    return config
}