const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = ['scroll-loop', 'floating-text', 'wave-hover', 'cutout-slider', 'inverse-scroll', 'post-process', 'glow-process', 'wave-sim'];
const pages = paths.map((el) => new HtmlWebpackPlugin({ // eslint-disable-line no-new
  filename: `${el}/index.html`, // specify filename or else will overwrite default index.html
  inject: {},
  template: `src/views/pages/${el}.hbs`,
  templateParameters: {
    asset_path: process.env.npm_lifecycle_event === 'dev' ? './src' : '',
  },
}));

module.exports = {
  entry: {
    app: ['@babel/polyfill', './src/app.js'],
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules | bower_components)/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]',
            },
          }, {
            loader: 'image-webpack-loader',
            options: {
              disable: true,
            },
          },
        ],
      },
      {
        test: /\.(hbs|handlebars)/,
        use: [
          {
            loader: 'handlebars-loader',
            query: {
              partialDirs: [path.join(__dirname, '../', 'src/views', 'partials')],
              helperDirs: [path.join(__dirname, '../', 'src/views', 'helpers')],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: {},
      template: 'src/views/pages/index.hbs',
      templateParameters: {
        asset_path: process.env.npm_lifecycle_event === 'dev' ? './src' : '',
        // eslint-disable-next-line
        links: require(path.join(__dirname, '../', 'src/views', 'json/').concat('homepage.json')),
      },
    }),
  ].concat(pages),
};
