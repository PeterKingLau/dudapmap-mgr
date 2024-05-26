const autoprefixer = require('autoprefixer');
//引入 postcss-pxtorem
const pxtorem = require('postcss-pxtorem');

module.exports = {

    css: {
        requireModuleExtension:true,

        loaderOptions: {
            postcss: {
                plugins: [
                    autoprefixer({
                        overrideBrowserslist: ['Android >= 4.0', 'iOS >= 7']
                    }),
                    pxtorem({
                        rootValue: 37.5, //换算的基数
                        propList: ['*'],
                        unitPrecision: 3,
                        minPixelValue: 2
                    })
                ]
            }
        }
    }
}