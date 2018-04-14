var gulp = require('gulp'),
    rename = require('gulp-rename'),
    del = require('del'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    notify = require('gulp-notify'),
    connect = require('gulp-connect'),

    sass = require("gulp-sass"),
    autoprefixer = require('gulp-autoprefixer'),

    webpack = require('webpack'),
    gutil = require("gulp-util");

var fs = require('fs');
var data = {},
    dirPath = "./gulp-config/";
var filenames = fs.readdirSync(dirPath);

filenames.forEach(function(filename) {
    data[filename] = require(dirPath + filename);
});

gulp.task('connect', function() {
    connect.server({
        port: 9999,
        root: './',
        livereload: true
    });
});

var keys = Object.keys(data);
keys.forEach(function(key) {
    var css = data[key].css,
        proName = data[key].name,
        liveSrc = data[key].liveSrc;

    gulp.task('clean:' + proName, function(cb) {
        return del([css.dist], cb);
    });

    gulp.task('live:css:' + proName, function() {
        gulp.src(liveSrc + '/**/*.html')
            .pipe(connect.reload());
    });

    gulp.task('build:' + proName + ':css', function() {
        return gulp.src(css.src + css.globs)
            .pipe(sourcemaps.init())
            .pipe(concat(css.distName))
            .pipe(sass({
                style: 'expanded'
            }).on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'iOS > 7', 'Android >= 4.0', 'Firefox > 20']
            }))
            .pipe(gulp.dest(css.dist))
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError))
            .pipe(sourcemaps.write('./', {
                includeContent: false,
                sourceRoot: '/' + css.src
            }))
            .pipe(gulp.dest(css.dist))
            .pipe(notify({
                message: 'css task complete'
            }));
    });

    gulp.task('watch:' + proName + ':css', ['connect'], function() {
        gulp.watch(css.src + "/**/*.scss", ['build:' + proName + ':css']);
        gulp.watch([liveSrc + '/**/*.html', liveSrc + '/**/*.scss'], ['live:css:' + proName]);
    });

    var script = data[key].script;
    gulp.task('build:' + proName + ':js', function(callback) {
        webpack({
            entry: script.entry,
            devtool: 'source-map',
            output: {
                path: script.output.path,
                filename: '[name].js'
            },
            module: {
                loaders: [{
                    test: /\.js|jsx$/,
                    exclude: /node_modules/,
                    loader: ['babel-loader'],
                    query: {
                        presets: script.presets
                    }
                },{
                    test: /\.vue$/,
                    loader: 'vue'
                }]
            },
            resolve: {
                alias: {
                    'vue$': 'vue/dist/vue.js'
                }
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('development') //production development
                    }
                }),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: true
                    }
                }),
                //new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fr|hu/)
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            ]
        }, function(err, stats) {
            if (err)
                throw new gutil.PluginError('webpack', err);
            gutil.log('[webpack]', stats.toString({
                colors: true,
                progress: true
            }));
            callback();
        });
    });

    gulp.task('project:' + proName + ':js', function(callback) {
        webpack({
            entry: script.entry,
            devtool: 'source-map',
            output: {
                path: script.output.path,
                filename: '[name].js'
            },
            module: {
                loaders: [{
                    test: /\.js|jsx$/,
                    exclude: /node_modules/,
                    loader: ['babel-loader'],
                    query: {
                        presets: script.presets
                    }
                },{
                    test: /\.vue$/,
                    loader: 'vue'
                }]
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('production') //production development
                    }
                }),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: true
                    }
                }),
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            ]
        }, function(err, stats) {
            if (err)
                throw new gutil.PluginError('webpack', err);
            gutil.log('[webpack]', stats.toString({
                colors: true,
                progress: true
            }));
            callback();
        });
    });


    gulp.task('live:js:' + proName, function() {
        gulp.src(liveSrc + '/**/*.html')
            .pipe(connect.reload());
    });

    gulp.task('watch:' + proName + ':js', ['connect'], function() {
        gulp.watch(liveSrc + "/js/**/*.js", ['build:' + proName + ':js']);
        gulp.watch([liveSrc + '/**/*.html', liveSrc + '/js/**/*.js'], ['live:js:' + proName]);
    });

    spritesmith = require('gulp.spritesmith');
    var sprite = data[key].images.sprite;
    gulp.task('build:' + proName + ':sprite', function() {
        var spriteData = gulp.src(sprite.src + "/*.png").pipe(spritesmith({
            // retinaSrcFilter: [sprite.src + "*@2x.png"],
            imgName: sprite.imgName || '../images/sprite.png',
            // retinaImgName: '../images/sprite@2x.png',
            cssName: sprite.cssName || 'sprite.scss',
            cssFormat: sprite.cssFormat || 'scss'
        }));
        spriteData.img.pipe(gulp.dest(sprite.dist));
        spriteData.css.pipe(gulp.dest(sprite.distScss));
        return spriteData;
    });

    gulp.task('watch:' + proName, ['connect'], function() {
        gulp.watch(liveSrc + "/scss/**/*.scss", ['build:' + proName + ':css']);
        gulp.watch(liveSrc + "/js/**/*.js", ['build:' + proName + ':js']);
        gulp.watch(liveSrc + "/images/icons/*.png", ['build:' + proName + ':sprite']);
        gulp.watch([liveSrc + '/**/*.*'], ['live:css:' + proName, 'live:js:' + proName]);
    });
});
