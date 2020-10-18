var fs = require('fs');
var path = require('path');
var express = require('express');
var exec = require('child_process').exec;
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
	cb(null, './public/images');
    },
    filename: (req, file, cb) => {
	console.log(file);
	var filetype = '';
	if(file.mimetype === 'image/gif') {
	    filetype = 'gif';
	}
	if(file.mimetype === 'image/png') {
		filetype = 'png';
	}
	if(file.mimetype === 'image/jpeg') {
	    filetype = 'jpg';
	}
	cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});

router.post('/upload',upload.single('file'),function(req, res, next) {
    console.log(req.file);
    if(!req.file) {
	res.status(500);
	return next(err);
    }

    var basePath = './public/images/';
    var outputFile = basePath + req.file.filename;
//    var cmd = 'tesseract ' + basePath + req.file.filename + ' stdout -l rus quiet';
    var cmd = 'tesseract ' + basePath + req.file.filename + ' stdout --oem 0 --psm 7 -l rus --user-patterns ' + basePath + 'my.patterns quiet';
    console.log("cmd " + cmd);
    exec(cmd, function(error, stdout, stderr) {
	var ot = stdout.replace("\n\f", "");
        ot = ot.split(' ').join('');
        ot = ot.toLowerCase();
        //console.log('error: ' + error);
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        console.log('recognized: "' + ot + '"');
	exec('rm ' + basePath + req.file.filename, function(error, stdout, stderr){
	    console.log('removing recognized image.');
	});
        res.json({ recognized: ot });
    });
})