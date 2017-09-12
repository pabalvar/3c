'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverViews: ['app/views/**/*.*'],
        serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
        clientViews: ['public/modules/**/views/**/*.html'],
        clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
        clientCSS: ['public/modules/**/*.css']
            //,mochaTests: ['app/tests/**/*.js']
    };

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            serverViews: {
                files: watchFiles.serverViews,
                options: {
                    livereload: true
                }
            },
            serverJS: {
                files: watchFiles.serverJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                options: {
                    livereload: true,
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientCSS: {
                files: watchFiles.clientCSS,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: watchFiles.clientJS.concat(watchFiles.serverJS),
                options: {
                    jshintrc: true
                }
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc',
            },
            all: {
                src: watchFiles.clientCSS
            }
        },
        uglify: {
            production: {
                options: {
                    mangle: false
                },
                files: {
                    'public/dist/application.min.js': 'public/dist/application.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/dist/application.min.css': '<%= applicationCSSFiles %>'
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    nodeArgs: ['--debug'],
                    ext: 'js,html',
                    watch: watchFiles.serverViews.concat(watchFiles.serverJS)
                }
            }
        },
        'node-inspector': {
            custom: {
                options: {
                    'web-port': 1337,
                    'web-host': 'localhost',
                    'debug-port': 5858,
                    'save-live-edit': true,
                    'no-preload': true,
                    'stack-trace-limit': 50,
                    'hidden': []
                }
            }
        },
        ngAnnotate: {
            production: {
                files: {
                    'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
                }
            }
        },
        concurrent: {
            default: ['nodemon', 'watch'],
            debug: ['nodemon', 'watch', 'node-inspector'],
            options: {
                logConcurrentOutput: true,
                limit: 10
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            },
            secure: {
                NODE_ENV: 'secure'
            }
        },
        /*mochaTest: {
        	src: watchFiles.mochaTests,
        	options: {
        		reporter: 'spec',
        		require: 'server.js'
        	}
        },
        karma: {
        	unit: {
        		configFile: 'karma.conf.js'
        	}
        },*/
        copy: {
            server: { cwd: '', src: ['server.js'], dest: 'dest/', expand: true },
            app: { expand: true, cwd: 'app/', src: ['**'], dest: 'dest/app' },
            config: {
                expand: true,
                cwd: 'config/',
                src: ['env/**', 'strategies/**',
                    'express.js', 'passport.js', 'passport-websrv.js', 'passport-test.js'
                ],
                dest: 'dest/config'
            },
            node_modules: {
                expand: true,
                cwd: 'node_modules/',
                src: ['express/**',
                    'express-session/**',
                    'body-parser/**',
                    'cookie-parser/**',
                    'compression/**',
                    'method-override/**',
                    'morgan/**',
                    'passport/**',
                    'passport-local/**',
                    'connect-mssql/**',
                    'connect-flash/**',
                    'consolidate/**',
                    'swig/**',
                    'lodash/**',
                    'glob/**',
                    'chalk/**',
                    'squel/**',
                    'mssql/**',
                    'qs/**',
                    'scribe-js/**',
                    'json-stringify-safe/**',
                    'q/**',
                    'async/**'
                ],
                dest: 'dest/node_modules'
            },
            public_lib: { expand: true, cwd: 'public/lib', src: ['**'], dest: 'dest/public/lib' },
            public_custom_lib: { expand: true, cwd: 'public/custom-lib', src: ['**'], dest: 'dest/public/custom-lib' },
            public_dist: { expand: true, cwd: 'public/dist', src: ['**'], dest: 'dest/public/dist' },
            public_assets: { expand: true, cwd: 'public/assets', src: ['**'], dest: 'dest/public/assets' },
            public_modules: {
                expand: true,
                cwd: 'public/modules',
                src: ['**/**.html',
                    '**/img/**', '**/images/**'
                ],
                dest: 'dest/public/modules'
            },
            nodewebkit: {
                expand: true,
                cwd: 'modulos_necesarios/nodewebkit',
                src: ['index.html', 'package.json', 'starter-template.css', 'random.png', 'main.js'],
                dest: 'dest/'
            },
            config_production: {
                expand: true,
                cwd: 'modulos_necesarios',
                src: ['config.js', 'init.js'],
                dest: 'dest/config/'
            },
            //enclose_production: {expand:true, cwd: 'modulos_necesarios/', src:['config.js', 'init.js','index.html','package.json'], dest: 'dest/config'},
            // enclose_compile: {expand:true, cwd: 'modulos_necesarios/', src:['compile_mini.js'], dest: 'dest/'}
        },
        nodewebkit: {
            options: {
                platforms: ['win32'],
                buildDir: './webkitbuilds', // Where the build version of my node-webkit app is saved
                version: '0.12.3',
            },
            src: ['./dest/**/*', './dest/package.json'] // Your node-webkit app
        },

        jsdoc: {
            dist: {
                src: ['public/modules/modules.js', 'public/modules/core/**/*.js'],//['app/**/*.js'],
                options: {
                    destination: 'doccli'
                        /*,
                        	                template : "node_modules/ink-docstrap/template",
                                      		configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"*/
                }
            }
        }

        //No se usa enclose, por el momento
        /*execute: {
	        target: {
	            src: ['dest/compile_mini.js']
	        }
	    },*/
        //clean: {
        //app: ["dest/app/**/*",],
        /*node_modules: ['dest/node_modules/express',
								//other node_modules
								],
			config: ["dest/config"],
			server: "dest/server.js",
			compile: "compile_mini.js"
		},*/

    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //dependencia necesaria para copiar
    grunt.loadNpmTasks('grunt-contrib-copy');

    //Corgo dependencia para crear app en node-webkit
    grunt.loadNpmTasks('grunt-node-webkit-builder');

    //Cargo tarea para generar jsdoc automatico
    grunt.loadNpmTasks('grunt-jsdoc');
   
    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    // A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
        var init = require('./config/init')();
        var config = require('./config/config');

        grunt.config.set('applicationJavaScriptFiles', config.assets.js);
        grunt.config.set('applicationCSSFiles', config.assets.css);
    });

    // Default task(s).
    grunt.registerTask('default', ['lint', 'concurrent:default']);

    // Debug task.
    grunt.registerTask('debug', ['lint', 'concurrent:debug']);

    // Secure task(s).
    grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Build task(s).
    grunt.registerTask('build', ['lint', 'loadConfig', 'ngAnnotate', 'uglify', 'cssmin']);

    //Copiar dist y hacer export de proyecto
    grunt.task.registerTask('export', ['copy']);

    //Realizar version ejecutable
    grunt.task.registerTask('make', ['execute', 'clean']);

    grunt.task.registerTask('webkit', ['nodewebkit']);
    //Version resumida para nodewebkit
    grunt.task.registerTask('make_version', ['lint', 'loadConfig', 'ngAnnotate', 'uglify', 'cssmin',
        'copy',
        'nodewebkit'
    ]);

    // Test task.
    //grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};