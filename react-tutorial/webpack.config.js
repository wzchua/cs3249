module.exports = {
    entry: './src/index.js',
 
    output: {
        path: __dirname + '/public/',
        filename: 'bundle.js'
    },
    devtool: 'source-map',
 
    devServer: {
        inline: true,
        port: 8080,
        contentBase: __dirname + '/public/'
    },
 
    module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        cacheDirectory: true,
                        presets: ['es2016', 'react']
                    }
                }
            ]
        }
};