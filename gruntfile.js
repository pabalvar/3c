module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngdocs: {
            options: {
                dest: 'docu'
            },
            api: {
                src: ['public/modules/core/**/*.js'],
                title: 'API Documentation'
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['env']
            },
            dist: {
                files: [{
                  expand: true,     // Enable dynamic expansion.
                  cwd: 'public/modules',      // Src matches are relative to this path.
                  src: ['**/*.js'],
                  dest: 'build/',   // Destination path prefix.
                  ext: '.js',   // Dest filepaths will have this extension.
                  extDot: 'first'   // Extensions in filenames begin after the first dot
                }]
              },
        },
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 8081,
                    base: 'docu'
                }
            }
        }
    });

    // ngdocs
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    // Default task(s).
    grunt.registerTask('default', ['ngdocs']);
    grunt.registerTask('docu', ['ngdocs', 'connect']);

};