//next.txt
//王  http://xing.911cha.com/NXZl.html

// 第一个 http://xing.911cha.com/YQ==.html  舒姓
// 最后一个 http://xing.911cha.com/OTlt.html  归海姓

var webDomain = 'http://xing.911cha.com/'
var nextFile = './next.txt';
var completeFile = './complete.txt';     
var completeList = [];
//实际上complete文件的最后一行就是下一次要抓的内容的地址。
//如果抓取过程中断了，将complete的最后一行复制到next.txt中去就可以。
var _count = 1;
var _MAX_COUNT = 500;

var fs=require('fs');  
var path=require('path');  
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');


function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(()=>{resolve();},ms);
  })
}

//start
getNextUrlFromFile().then((uri)=>fetchPage(uri))

//封装一层函数，用于递归
function fetchPage(url){
  startRequest(url);
}

function startRequest(url){
  console.log('=======================================================startRequest url=', url,  _count);
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
      var xTitle = $('div#mainbox .mcon h2').text().trim()
      var x_item = {
        title: xTitle,
        link: url,
        count: _count     //获取了多少个地址的内容了
      };
      console.log(x_item);

      //获取标题，作为文件保存的文件名
      saveContent($, xTitle);   //保存内容
      
      //分析下一地址
      let tmp = $('div#mainbox .mcon h2').parent().parent().children('div.mtitle').find('div.more').children('a')
      let tmp2 = tmp[0];
      let tmp3 = tmp2.attribs.href;
      let tmp4 = $(tmp2).text();

      console.log('==========下一个内容:', tmp3);
      //控制要取多少次
      if (completeList.indexOf(tmp3)<0){
          //控制要取多少次， 加入休眠时间，防止封IP
        var sTime =  Math.random() * 10;    
        sTime = 2000 + 1000 * Math.ceil(sTime/2) ;    // 最小3000， 最大7000
        if ( _count < _MAX_COUNT ){
          _count++
          mySaveUri(tmp3, tmp4);

          let nextLink =  `${webDomain}${tmp3}`;
          nextLink = encodeURI(nextLink);
          console.log('==========下一个地址:', nextLink , tmp4);  
          console.log('============================================================sleep:', sTime);
          sleep(sTime).then(()=>fetchPage(nextLink));
        }else{
          console.warn('!!!!!!!!!!达到本次设定的抓取次数，程序终止！_MAX_COUNT=', _MAX_COUNT);
        }
      }else{
        console.warn('!!!!!!!!!!下一个内容地址已经在本地complete.txt中存在，程序终止！');
      }
    }
  })
}

//按需要保存所需要的内容到本地文件
function saveContent($, news_title){
  let fn = './data/' + news_title + '.txt';
  if ( fs.existsSync(fn) ) fs.unlinkSync(fn);
  let c=0;
  //分析内容
  //let tmp = $('div#mainbox .mcon h2').parent().children('p.f14')
  $('div#mainbox .mcon h2').parent().children('p.f14').children().each(function(index, item){
    let x = $(this);
    let y='';
    if ((x[0].type == 'tag' )&& (x[0].name == 'br') ){
      y = '\r\n';
    }
    if((x[0].next) && (x[0].next.type == 'text' )){
      y = y + x[0].next.data;
    }
    console.log(`==========saveContent: data.size = ${y.length}        ---${++c}`);
    //根据需要将文本内容一段一段的写入文件中
    fs.appendFileSync(fn, y, 'utf-8');   //同步写入，否则顺序有可能混乱。
  })
}



///////////////////////////////////////////////////////////////////////////////////
function getNextUrlFromFile(){
  var fileName=path.resolve(nextFile);  
  //读取文本文件
  return new Promise((resolve,reject)=>{  
      fs.readFile(fileName, {flag:'r+',encoding:'utf8'}, function(err,data){  
        if(err){
          console.error(err);
          return reject(err);
        }
        //获取到文件的所有内容  
        console.log('getNextUrlFromFile=', data);  
        myGetComplete();
        return resolve(data);      
    });  
  })
}

function myGetComplete(){
  let fileName=path.resolve(completeFile);  
  let fileData =  fs.readFileSync(fileName,{flag:'r+',encoding:'utf8'});
  console.log('myGetComplete=', fileData);  
  completeList = fileData.split('\r\n');
  console.log('myGetComplete=', completeList);    
}

function mySaveUri(new_uri, new_name){
  console.log('=====================mySaveUri',new_uri, new_name);
  let x = new_uri.trim();
  let y =`${x}\r\n${new_name}\r\n` ;
  fs.appendFileSync(completeFile, y, 'utf-8');
  completeList.push(x);
}