const path = require("path");
const dotenv = require("dotenv");
const webpack = require("webpack");

module.exports = {
	// The entry point file described above
	plugins: [
		new webpack.DefinePlugin({
			"process.env": JSON.stringify(dotenv.config().parsed),
		}),
		// ...
	],
	entry: {
		index: ["./src/index.js"],
	},
	// The location of the build folder described above
	output: {
		path: path.resolve(__dirname, "dist/js"),
		filename: "[name].js",
	},
	// Optional and for development only. This provides the ability to map the built code back to the original source format when debugging.
	devtool: "eval-source-map",
	mode: "development",
	experiments: {
		topLevelAwait: true,
	},
	resolve: {
		fallback: {
			path: require.resolve("path-browserify"),
			os: require.resolve("os-browserify/browser"),
			crypto: require.resolve("crypto-browserify"),
			stream: require.resolve("stream-browserify"),
			buffer: require.resolve("buffer/"),
		},
	},
};
