const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: ['@babel/polyfill', './src/app.js']
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules | bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: true
            }
          }
        ] 
      },
      {
        test: /\.(hbs|handlebars)/,
        use: [
          {
            loader: 'handlebars-loader',
            query: {
              partialDirs: [path.join(__dirname, '../', 'src/views', 'partials')],
              helperDirs: [path.join(__dirname, '../', 'src/views', 'helpers')]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: {},
      template: "src/views/pages/index.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'scroll-loop/index.html',
      inject: {},
      template: "src/views/pages/scroll-loop.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'floating-text/index.html',
      inject: {},
      template: "src/views/pages/floating-text.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'wave-hover/index.html',
      inject: {},
      template: "src/views/pages/wave-hover.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'cutout-slider/index.html',
      inject: {},
      template: "src/views/pages/cutout-slider.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'inverse-scroll/index.html',
      inject: {},
      template: "src/views/pages/inverse-scroll.hbs"
    }),
    new HtmlWebpackPlugin({
      filename: 'custom-player/index.html',
      inject: {},
      template: "src/views/pages/custom-player.hbs"
    }),
  ]
}
