/* jshint node: true */
module.exports = function(grunt) {

  grunt.initConfig({
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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify']);

};