import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import packageJson from "./package.json";
import { Configuration } from "webpack";

const config: Configuration = {
  target: "node",
  mode: "production",
  devtool: false,
  entry: {
    main: "@/main.ts",
  },
  output: {
    libraryTarget: "commonjs2",
    libraryExport: "default",
    path: path.resolve(__dirname, "./dist"),
    filename: `${packageJson.scriptOutputName}.js`,
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@t": path.resolve(__dirname, "./types"),
      "@u": path.resolve(__dirname, "./src/utils"),
      "@api": path.resolve(__dirname, "./src/api"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  optimization: {
    minimize: true,

    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: /main/,
          mangle: false,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

export default config;
