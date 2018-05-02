//next.txt
//王  http://xing.911cha.com/NXZl.html
var nextFile = './next.txt';
var webDomain = 'http://xing.911cha.com/'

var fs=require('fs');  
var path=require('path');  
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');

var webUrl;

var count = 0;

//start
//getNextUrlFromFile().then(uri=>fetchPage(uri))


//封装一层函数，用于递归
function fetchPage(url){
  startRequest(url);
}

function startRequest(url){
  console.log('startRequest url=', url);
  var options = {
    url: url,
    headers:{
      'User-Agent' : 'request'
    }
  }
  request(options, function(error, res, body){
    if(error){
      console.log(error);
    }else if(res.statusCode !=200){
      console.log('request res.statusCode=', res.statusCode)
    }else{
      var $ = cheerio.load(body);     //采用cheerio解析html, 就可以使用dom选择器了(跟jquery相似)
      console.log()
      var xTitle = $('div#mainbox .mcon h2').text().trim()
      var x_item = {
        title: xTitle,
        link: url,
        count: count = count + 1     //获取了多少个地址的内容了
      };
      console.log(x_item);

      //获取标题，作为文件保存的文件名
      //saveContent($, xTitle);   //保存内容
      
      //分析下一地址
      var tmp = $('div#mainbox .mcon h2').parent().parent('div.more a').attr('href');
      console.log(tmp);
      var nextLink =  webDomain + tmp;
      nextLink = encodeURI(nextLink);
      console.log('下一个地址：', nextLink);
      //控制要取多少次， 可加入休眠时间，防止封IP
      // if (i<=500){
      //   fetchPage(str);
      // }
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

myDemo();
function myDemo(){
  var fileName = path.resolve('./xing.html');
  fs.readFile(fileName, {flag:'r+',encoding:'utf8'}, function(err,data){  
    if(err){
      console.error(err);
   }
    //console.log('data=', data);  
    var $ = cheerio.load(data);     //采用cheerio解析html, 就可以使用dom选择器了(跟jquery相似)
    var xTitle = $('div#mainbox .mcon h2').text().trim()
    console.log(xTitle);

    //获取标题，作为文件保存的文件名
    //saveContent($, xTitle);   //保存内容
    
    //分析下一地址
    var tmp = $('div#mainbox .mcon h2').parent().parent().children('div.mtitle').find('div.more').children('a')
    var tmp2 = tmp[1];
    console.log(tmp2.attribs.href);
    let tmp3 = tmp2.attribs.href;

    var nextLink =  `${webDomain}${tmp3}`;
    nextLink = encodeURI(nextLink);
    console.log('下一个地址:', nextLink);  

    mySaveContent($, xTitle);
  });  
}

//按需要保存所需要的内容到本地文件
function mySaveContent($, news_title){

  //分析内容
  var tmp = $('div#mainbox .mcon h2').parent().children('p.f14')
  //console.log(tmp);

  $('div#mainbox .mcon h2').parent().children('p.f14').children().each(function(index, item){
    var x = $(this);
    var y='';
    if ((x[0].type == 'tag' )&& (x[0].name == 'br') ){
      console.log('');
      y = '\r\n';
    }
    if((x[0].next) && (x[0].next.type == 'text' )){
      console.log(x[0].next.data);
      y = y + x[0].next.data;
    }

    //根据需要将文本内容一段一段的写入文件中
    // fs.appendFile('./data/' + news_title + '.txt', y, 'utf-8', function(err){
    //   if (err){console.log(err)};
    // });
    fs.appendFileSync('./data/' + news_title + '.txt', y, 'utf-8');
  })
}


