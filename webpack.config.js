const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const PATH_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: PATH_JS + "main.js",
    videoPlayer: PATH_JS + "videoPlayer.js",
    commentSection: PATH_JS + "commentSection.js",
    thumbnailExtractor: PATH_JS + "thumbnailExtractor.js",
    404: PATH_JS + "404.js",
  },
  mode: "development",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.css",
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
