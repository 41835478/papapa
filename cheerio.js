
var cheerio = require('cheerio');
var body = `
<html xmlns="http://www.w3.org/1999/xhtml">
<head></head>
<body>
<div id="mainbox">
  <div class="leftbox">
    <div class="panel">
      <div class="mtitle"></div>
      <div class="mcon"><h3 class="f36 blue">尤姓2</h3></div>
    </div>
    <div class="panel">
      <div class="mtitle"></div>
      <div class="mcon"><h2 class="f36 blue">尤姓</h2></div>
    </div>  
  </div>
</div>
</body>
</html>
`

var $ = cheerio.load(body);    

var xTitle = $('div#mainbox .mcon h2').text();

console.log(xTitle)
