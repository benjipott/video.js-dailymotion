/* jshint node: true */
module.exports = function(grunt) {

  grunt.initConfig({
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['jshint', 'uglify']);

};
