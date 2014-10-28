'use strict';


module.exports = function less(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-less');

	// Options
	return {
        development: {
            options: {
                compress: false
            },
            files:{
                "../css/base.css": "../less/base.less",
                "../css/carousel.css": "../less/_carousel.less",
                "../css/markup.css": "../less/_markup.less",
                "../css/pygments.css": "../less/_pygments.less"
            }
        },
        production: {
            options: {
                paths: ["assets/css"],
                cleancss: true,
                modifyVars: {
                    imgPath: '"http://mycdn.com/path/to/images"',
                    bgColor: 'red'
                }
            },
            files: {
                "path/to/result.css": "path/to/source.less"
            }
        }
	};
};
