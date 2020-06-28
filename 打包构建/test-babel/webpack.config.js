var path = require('path');
debugger
module.exports = function(a,b,c,d,e,f){
    var config = {}
    switch (process.env.type) {
        case 'babelLoader':
            config = {
                entry: [ './src/babel_loader.js'],
                output: {
                    path: path.join(__dirname, 'dist'),
                    filename: 'babel_loaderResult.js'
                },
                module:{
                    rules: [
                        {
                            test: /\.js$/, use: [{loader: 'babel-loader', }],
                            exclude: /node_modules/,
                        }
                    ]
                },
                mode: 'development',
                devtool: 'inline-source-map'
            }
            return config
        case 'polyfill':
            config = {
                entry: ['./src/polyfill.js'],
                output: {
                    path: path.join(__dirname, 'dist'),
                    filename: 'babel_polyfillResult.js'
                },
                module:{
                    rules: [
                        {
                            test: /\.js$/, use: [{loader: 'babel-loader', }],
                            exclude: /node_modules/,
                        }
                    ]
                },
                mode: 'development',
                devtool: 'inline-source-map'
            }
            return config
        case 'babelRuntime':
            config = {
                entry: ['./src/babel_runtime.js'],
                output: {
                    path: path.join(__dirname, 'dist'),
                    filename: 'babel_runtimeResult.js'
                },
                module:{
                    rules: [
                        {
                            test: /\.js$/, use: [{loader: 'babel-loader', }],
                            exclude: /node_modules/,
                        }
                    ]
                },
                mode: 'development',
                devtool: 'inline-source-map'
            }
            return config
        case 'babelRegister':
            config = {
                entry: ['./src/babel_register.js'],
                output: {
                    path: path.join(__dirname, 'dist'),
                    filename: 'babel_registerResult.js'
                },
                mode: 'development',
                devtool: 'inline-source-map'
            }
            return config
    }
    return config
}
// module.exports = {
//     entry: './src/babel_loader.js',
//     output: {
//         path: path.join(__dirname, 'dist'),
//         filename: 'babel_loaderResult.js'
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js$/, 
//                 use: 'babel-loader'
//             },
//         ]
//       },
//     mode: 'development',
//     devtool: 'source-map'
// }
//options: {useBuiltIns: 'entry'}
// "babel-polyfill",