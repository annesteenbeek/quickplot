module.exports = function(grunt) {

  grunt.initConfig({
    nwjs: {
      options: {
        version: '0.12.0', // older version to fix extraction bug
        build_dir: './build',
          mac: false,
          win: false,
          linux32: false,
          linux64: true
        },
        src: [
          'src/index.html', 
          'src/app.js', 
          'src/script.js', 
          'package.json', 
          'node_modules/**/*', 
          'src/bower_components/**/*'
          ]
     },
  })
grunt.loadNpmTasks('grunt-nw-builder');
grunt.registerTask('build', ['nwjs']);
}