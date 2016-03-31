module.exports = function(grunt) {

  grunt.initConfig({
    nwjs: {
      options: {
        version: '0.12.0', // older version to fix extraction bug
        build_dir: './build',
          mac: false,
          win: false,
          linux: true
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
     wiredep: {
       task: {
         src: [
           'src/index.html',   // .html support...
         ],
         options: {
         }
       }
     }
  })
grunt.loadNpmTasks('grunt-nw-builder');
grunt.loadNpmTasks('grunt-wiredep');
grunt.registerTask('build', ['nwjs']);
}