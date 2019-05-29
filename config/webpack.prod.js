const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new TerserJSPlugin({}),
			new OptimizeCSSAssetsPlugin({})
		],
		runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all' 
					} 
				} 
			}
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							// you can specify a publicPath here
							// by default it uses publicPath in webpackOptions.output
							// publicPath: '../',
							// hmr: process.env.NODE_ENV === 'development',
						},
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader',
						options: {
							config: {
								path: __dirname + '/config/postcss.config.js'
							}
						},
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		]
	},
	plugins: [
    new CleanWebpackPlugin(['dist/*'], {
    	root: path.join(__dirname, '../')
    }),
		new MiniCssExtractPlugin('/css/style.css'),
		new webpack.HashedModuleIdsPlugin()
	]
})
