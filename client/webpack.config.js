const path = require('path');
const webpack = require('webpack'); // Add this line
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const dotenv = require('dotenv');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    // Load environment variables from .env files
    const envFile = isProduction ? '.env.production' : '.env.development';
    const envVars = dotenv.config({ path: envFile }).parsed || {};

    // Fallback to .env if specific env file doesn't exist
    if (Object.keys(envVars).length === 0) {
        const fallbackEnv = dotenv.config({ path: '.env' }).parsed || {};
        Object.assign(envVars, fallbackEnv);
    }

    return {
        // Entry point - where webpack starts building
        entry: './src/index.tsx',

        // Output configuration
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction
                ? 'js/[name].[contenthash].js'
                : 'js/[name].js',
            chunkFilename: isProduction
                ? 'js/[name].[contenthash].chunk.js'
                : 'js/[name].chunk.js',
            publicPath: '/',
            clean: true
        },

        // Module resolution
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@/components': path.resolve(__dirname, 'src/components'),
                '@/services': path.resolve(__dirname, 'src/services'),
                '@/types': path.resolve(__dirname, 'src/types'),
                '@/styles': path.resolve(__dirname, 'src/styles'),
            },
            fallback: {
                "process": false,
                "buffer": false,
            }
        },

        // How to process different file types
        module: {
            rules: [
                // TypeScript/JavaScript files
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true, // Faster builds
                        }
                    }
                },

                // CSS files
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader'
                    ]
                },

                // Less files
                {
                    test: /\.less$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    // Less configuration
                                    modifyVars: {
                                        '@primary-color': '#1890ff',
                                        '@success-color': '#52c41a',
                                        '@warning-color': '#faad14',
                                        '@error-color': '#f5222d',
                                    },
                                    javascriptEnabled: true,
                                },
                                additionalData: `
                                    @primary-color: #1890ff;
                                    @success-color: #52c41a;
                                    @warning-color: #faad14;
                                    @error-color: #f5222d;
                                    @text-color: #000000d9;
                                    @text-color-secondary: #00000073;
                                    @background-color: #f5f7fa;
                                    `
                            }
                        }
                    ]
                },

                // Images and fonts
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[name].[contenthash][ext]'
                    }
                }
            ]
        },

        plugins: [
            new CleanWebpackPlugin(),

            new HtmlWebpackPlugin({
                template: './public/index.html',
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                } : false
            }),

            // Add DefinePlugin to inject environment variables
            new webpack.DefinePlugin({
                'process.env': JSON.stringify({
                    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:7000/api',
                    REACT_APP_ENV: process.env.REACT_APP_ENV || 'development',
                    REACT_APP_LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
                }),
            }),

            // Extract CSS in production
            ...(isProduction ? [
                new MiniCssExtractPlugin({
                    filename: 'css/[name].[contenthash].css',
                    chunkFilename: 'css/[name].[contenthash].chunk.css',
                })
            ] : [])
        ],

        // Optimization
        optimization: {
            minimize: isProduction,
            minimizer: [
                '...',
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    }
                }
            }
        },

        // Development server
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            port: 3000,
            open: true,
            hot: true,
            historyApiFallback: true, // For React Router
            proxy: [
                {
                    context: ['/api'],
                    target: 'https://localhost:7000',
                    secure: false,
                    changeOrigin: true,
                }
            ]
        },

        // Source maps for debugging
        devtool: isProduction ? 'source-map' : 'eval-source-map',
    };
};