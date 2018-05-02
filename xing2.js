//next.txt
//王  http://xing.911cha.com/NXZl.html
var nextFile = './next.txt';
var completeFile = './complete.txt';
var webDomain = 'http://xing.911cha.com/'

var fs=require('fs');  
var path=require('path');  
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
//var request = require('superagent');

var webUrl;

var count = 0;

//start
getNextUrlFromFile().then(uri=>fetchPage(uri))


//封装一层函数，用于递归
function fetchPage(url){
  startRequest(url);
}

function startRequest(url){
  console.log('startRequest url=', url);
  //url='http://xing.911cha.com';
  //url='http://www.911cha.com';
  var options = {
    url: url,
    headers:{
      'User-Agent' : 'request'
    }
  }
  request(options, function(error, res, body){
    if(!error && res.statusCode==200){
      console.log(body);
    }
  })
}

//按需要保存所需要的内容到本地文件
function saveContent($, news_title){
  $('.article-content p').each(function(index, item){
    var x = $(this).text();
    var y = x.substring(0, 2).trim();
    if(y == ''){
      x = x + '\n';
      //根据需要将文本内容一段一段的写入文件中
      fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function(err){
        if (err){console.log(err)};

      });
    }
  })
}


function getNextUrlFromFile(){
  var fileName=path.resolve(nextFile);  
  //读取文本文件
  return new Promise((resolve)=>{  
      fs.readFile(fileName, {flag:'r+',encoding:'utf8'}, function(err,data){  
        if(err){
          console.error(err);
          return resolve();
        }
        //获取到文件的所有内容  
        console.log('getNextUrlFromFile=', data);  
        return resolve(data);      
    });  
  })
}

//getNextUrlFromFile();