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
                files: {
                    'dist/app.js': 'src/app.js'
                }
            }
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
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    // Default task(s).
    grunt.registerTask('default', ['ngdocs']);
    grunt.registerTask('docu', ['ngdocs', 'connect']);

};