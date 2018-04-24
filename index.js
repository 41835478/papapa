var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = "http://www.ss.pku.edu.cn/index.php/newscenter/news/3542"
//初始url

//封装一层函数，用于递归
function fetchPage(x){
  startRequest(x);
}

function startRequest(x){
  // http get(url)
  http.get(x, function(res){
    var html = ''       //保存返回的整个html内容
    var titles = [];
    res.setEncoding('utf-8');
    //监听 data 事件，获取 html 数据
    res.on('data', function(chunk){
      html += chunk;
    });
    //监听 end 事件， 获取html数据结束，开始处理
    res.on('end', function(){
      var $ = cheerio.load(html);     //采用cheerio解析html, 就可以使用dom选择器了(跟jquery相似)
      var time = $('.article-info a:first-child').next().text().trim();
      var news_item = {
        title: $('div.article-title a').text().trim(),
        time: time,
        link: 'http://www.ss.pku.edu.cn' + $('div.article-title a').attr('href'),
        author: $('[title=供稿]').text().trim(),
        i: i = i+1     //获取了多少个地址的内容了
      };
      console.log(news_item);
      var news_title = $('div.article-title a').text().trim();
      //获取标题，作为文件保存的文件名
      saveContent($, news_title);   //保存内容
      
      //分析下一地址
      var nextLink = "http://www.ss.pku.edu.cn" + $('li.next a').attr('href');
      str1 = nextLink.split('-');   //去掉url中的干扰内容
      str = encodeURI(str1[0]);
      console.log('下一个地址：', str);
      //控制要取多少次， 可加入休眠时间，防止封IP
      // if (i<=500){
      //   fetchPage(str);
      // }
    });

  }).on('error', function(err){
    console.log(err);
  });
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


//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($,news_title) {
  $('.article-content img').each(function (index, item) {
      var img_title = $(this).parent().next().text().trim();  //获取图片的标题
      if(img_title.length>35||img_title==""){
       img_title="Null";}
      var img_filename = img_title + '.jpg';

      var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src'); //获取图片的url

//采用request模块，向服务器发起一次请求，获取图片资源
      request.head(img_src,function(err,res,body){
          if(err){
              console.log(err);
          }
      });

       //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
      request(img_src).pipe(fs.createWriteStream('./image/'+news_title + '---' + img_filename));    
  })
}

//运行程序
fetchPage(url);