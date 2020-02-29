const path = require("path");
const webpack = require("webpack");
const wextManifest = require("wext-manifest");
const ZipPlugin = require("zip-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteWebpackPlugin = require("write-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { CheckerPlugin } = require("awesome-typescript-loader");
const ExtensionReloader = require("webpack-extension-reloader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const manifestInput = require("./src/manifest");

const sourcePath = path.join(__dirname, "src");
const assetsPath = path.join(sourcePath, "assets");
const viewsPath = path.join(assetsPath, "views");
const destPath = path.join(__dirname, "extension");
const nodeEnv = process.env.NODE_ENV || "development";
const targetBrowser = process.env.TARGET_BROWSER;
const manifest = wextManifest[targetBrowser](manifestInput);

const extensionReloaderPlugin =
  nodeEnv === "development"
    ? new ExtensionReloader({
        port: 9090,
        reloadPage: true,
        entries: {
          // TODO: reload manifest on update
          contentScript: "content",
          background: "background",
          extensionPage: ["popup", "options"]
        }
      })
    : () => {
        this.apply = () => {};
      };

const getExtensionFileType = browser => {
  if (browser === "opera") {
    return "crx";
  }

  if (browser === "firefox") {
    return "xpi";
  }

  return "zip";
};

module.exports = {
  mode: nodeEnv,

  entry: {
    background: path.join(sourcePath, "background", "index.ts"),
    content: path.join(sourcePath, "content", "index.ts"),
    popup: path.join(sourcePath, "popup", "index.tsx"),
    options: path.join(sourcePath, "options", "index.tsx")
  },

  output: {
    filename: "js/[name].bundle.js",
    path: path.join(destPath, targetBrowser)
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "webextension-polyfill-ts": path.resolve(
        path.join(__dirname, "node_modules", "webextension-polyfill-ts")
      ),
      "@": path.resolve("src")
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)?$/,
        loader: "awesome-typescript-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [require("autoprefixer")()]
            }
          },
          "resolve-url-loader",
          "less-loader"
        ]
      }
    ]
  },

  plugins: [
    // for awesome-typescript-loader
    new CheckerPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(["NODE_ENV", "TARGET_BROWSER"]),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(
          process.cwd(),
          `extension/${targetBrowser}.${getExtensionFileType(targetBrowser)}`
        )
      ],
      cleanStaleWebpackAssets: false,
      verbose: true
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, "popup.html"),
      inject: "body",
      chunks: ["popup"],
      filename: "popup.html"
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, "options.html"),
      inject: "body",
      chunks: ["options"],
      filename: "options.html"
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
    // copy static assets
    new CopyWebpackPlugin([{ from: "src/assets", to: "assets" }]),
    // write manifest.json
    new WriteWebpackPlugin([
      { name: manifest.name, data: Buffer.from(manifest.content) }
    ]),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin
  ],

  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      }),
      new ZipPlugin({
        path: destPath,
        extension: `${getExtensionFileType(targetBrowser)}`,
        filename: `${targetBrowser}`
      })
    ]
  }
};
