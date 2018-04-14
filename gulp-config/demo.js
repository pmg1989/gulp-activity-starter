var config = {
    name: "demo",
    liveSrc: "./views/demo",
    css: {
        src: "./views/demo/scss",
        globs: "/styles.scss",
        dist: "./build/demo/css",
        distName: "styles.css"
    },
    script: {
        entry: {
          'script':'./views/demo/js/script.js',
        },
        output: {
            path: './build/demo/js/'
        },
        presets:['es2015']
    },
    images: {
      sprite:{
        src:'./views/demo/images/icons',
        dist:'./build/demo/images/',
        distScss:'./views/demo/scss/'
      }
    }
};

module.exports = config;
