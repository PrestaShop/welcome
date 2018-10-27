const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const browsers = [
  'defaults',
  'ie >= 9',
  'ie_mob >= 10',
  'edge >= 12',
  'chrome >= 30',
  'chromeandroid >= 30',
  'android >= 4.4',
  'ff >= 30',
  'safari >= 9',
  'ios >= 9',
  'opera >= 36',
];

module.exports = {
  entry: {
    back: './ts/back/index.ts',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css'],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'module.js',
    libraryTarget: 'var',
    library: ['WelcomeModule', '[name]'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [
          path.resolve(__dirname, 'ts'),
        ],
        exclude: path.resolve(__dirname, 'node_modules'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers,
                },
                useBuiltIns: 'entry',
                debug: false,
              }],
              '@babel/typescript',
            ],
            sourceMap: true,
          },
        },
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, 'scss'),
        ],
        use: [
          // fallback to style-loader in development
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')({
                browsers,
              })],
            }
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            context: '',
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'module.css',
      chunkFilename: '[id].css',
    }),
  ],
};
