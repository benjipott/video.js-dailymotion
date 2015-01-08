/* jshint node: true */
module.exports = function (grunt) {

  grunt.initConfig({
    vjsPath: 'bower_components/video.js/dist/video-js',
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },
    uglify: {
      vjsdailymotion: {
        options: {
          mangle: false
        },
        files: {
          'dist/vjs.dailymotion.js': ['src/dailymotion.js']
        }
      }
    },
    /*jshint -W106 */
    mocha_phantomjs: {
      /*jshint +W106 */
      all: {
        options: {
          urls: ['http://localhost:8080/test/unit/runner.html']
        }
      }
    },
    protractor: {
      options: {
        keepAlive: false,
        noColor: false
      },
      local: {
        options: {
          configFile: 'test/functional/local.config.js'
        }
      },
      saucelabs: {
        options: {
          configFile: 'test/functional/saucelabs.config.js',
          args: {
            sauceUser: process.env.SAUCE_USERNAME,
            sauceKey: process.env.SAUCE_ACCESS_KEY
          }
        }
      }
    },
    connect: {
      options: {
        open: true,
        hostname: 'localhost',
        port: 9000
      },
      livereload: {
        options: {
          open: {
            target: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/example'
          }
        }
      }
    },
    watch: {
      sources: {
        files: [
          'src/**/*.js',
          'Gruntfile.js'
        ],
        options: {
          livereload: true
        },
        tasks: ['default']
      }
    },
    concat: {
      example: {
        files: [
          {
            src: [
              '<%= vjsPath %>/video.js',
              'dist/vjs.daylymotion.js',
            ],
            dest: 'example/demo.js'
          },
          {
            src: [
              '<%= vjsPath %>/video-js.css'
            ],
            dest: 'example/demo.css'
          }
        ]

      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');

  grunt.registerTask('default', ['jshint', 'uglify']);

  grunt.registerTask('serve', ['connect', 'watch']);

  grunt.registerTask('build', ['default', 'concat']);

  grunt.registerTask('test', function () {
    if (process.env.TRAVIS_PULL_REQUEST === 'false') {
      grunt.task.run(['jshint', 'connect:server', 'mocha_phantomjs', 'protractor:saucelabs']);
    } else if (process.env.TRAVIS) {
      grunt.task.run(['jshint', 'connect:server', 'mocha_phantomjs']);
    } else {
      grunt.task.run(['jshint', 'connect:server', 'mocha_phantomjs', 'protractor:local']);
    }
  });
};
