'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {//设置代理
      '/apiTwo':{
        //target 是后台的接口地址
          // target:"http://192.168.110.140:8081/",//测试
          target:"http://182.137.194.151:51000/hxd-1.0.0/",//测试c
          // target:"http://182.137.194.151/51000/wm-1.0.0/",//测试c
        
          pathRewrite:{
           '^/apiTwo':''//apiTwo   路径重写
          },
        // secure:false,//如果是HTTPS接口，需要配置这个参数
          changeOrigin:true,//是否启用跨域
          headers:{
            // Referer:'http://192.168.110.140:8081/'
            Referer:'http://192.168.110.140:8081/'
          }
      },
      '/api':{
        //target 是后台的接口地址

          // target:"http://182.137.194.151:51000/wm-1.0.0/",//测试运动经纬度
       //   target:"http://182.137.194.151:51000/hxd-1.0.0/",//测试运动经纬度
            target:"http://localhost:8080/hxd-1.0.1/",  
       pathRewrite:{
           '^/api':''//‘api’代替了target里面的地址   路径重写
          },
        // secure:false,//如果是HTTPS接口，需要配置这个参数
          changeOrigin:true,//是否启用跨域
          headers:{
            Referer:'http://182.137.194.151:51000/hxd-1.0.0/'
            // Referer:'http://182.137.194.151:51000/wm-1.0.0/'
          }
      },
     
      
    },

    // Various Dev Server settings
   // host: 'localhost', // can be overwritten by process.env.HOST
  //  host:'192.168.110.123',
   host:'localhost',
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    
    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
