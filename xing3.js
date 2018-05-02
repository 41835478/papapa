//next.txt
//王  http://xing.911cha.com/NXZl.html
var nextFile = './next.txt';
var completeFile = './complete.txt';
var webDomain = 'http://xing.911cha.com/'
var completeList = [];
var _count =1;

var fs=require('fs');  
var path=require('path');  
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
//var request = require('superagent');

var webUrl;

var count = 0;

function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(()=>{resolve();},ms);
  })
}

myGetComplete();
myDemo();
function myDemo(){
  console.log('========================================count:', _count);
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
    mySaveContent($, xTitle);
    //分析下一地址
    var tmp = $('div#mainbox .mcon h2').parent().parent().children('div.mtitle').find('div.more').children('a')
    var tmp2 = tmp[1];
    console.log(tmp2.attribs.href);
    let tmp3 = tmp2.attribs.href;
    
    if (completeList.indexOf(tmp3)<10){
      mySaveUri(tmp3);

      var nextLink =  `${webDomain}${tmp3}`;
      nextLink = encodeURI(nextLink);
      console.log('下一个地址:', nextLink);  
        //控制要取多少次， 加入休眠时间，防止封IP
      var sTime =  Math.random() * 10;    
      sTime = 2000 + 1000 * Math.ceil(sTime/2) ;    // 最小3000， 最大7000
      if (_count<=3){
        _count++
        console.log('============================================================sleep:', sTime);
        sleep(sTime).then(()=>myDemo());
      }
    }else{
      console.warn('下一个内容地址已经在本地complete.txt中存在，程序终止！');
    }

  });  
}

function mySaveUri(news_title){
  console.log('=====================mySaveUri',news_title, _count);
  var x = news_title.trim();
  var y = x + '\r\n';
  fs.appendFileSync(completeFile, y, 'utf-8');
  completeList.push(x);
}


//按需要保存所需要的内容到本地文件
function mySaveContent($, news_title){
  var fn = './data/' + news_title + '.txt';
  //分析内容
  var tmp = $('div#mainbox .mcon h2').parent().children('p.f14')
  //console.log(tmp);
  fs.unlinkSync(fn);
  $('div#mainbox .mcon h2').parent().children('p.f14').children().each(function(index, item){
    var x = $(this);
    var y='';
    if ((x[0].type == 'tag' )&& (x[0].name == 'br') ){
      y = '\r\n';
    }
    if((x[0].next) && (x[0].next.type == 'text' )){
      y = y + x[0].next.data;
    }
    //console.log(y);
    fs.appendFileSync(fn, y, 'utf-8');
  })
}

function myGetComplete(){
  var fileName=path.resolve(completeFile);  
  let fileData =  fs.readFileSync(fileName,{flag:'r+',encoding:'utf8'});
  console.log('myGetComplete=', fileData);  
  completeList = fileData.split('\r\n');
  console.log('myGetComplete=', completeList);    
}