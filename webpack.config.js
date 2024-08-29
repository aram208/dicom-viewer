const path = require('path');

const vtkRules = require('@kitware/vtk.js/Utilities/config/dependency.js').webpack.core.rules;

module.exports = {
    entry: {
        app: path.join(__dirname, 'src', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                ],
            }].concat(vtkRules),
    },
    resolve: {
        extensions: ['.js'],
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        disableHostCheck: true,
        hot: false,
        quiet: false,
        noInfo: false,
        stats: {
            colors: true
        },
    },
};
