var onamebook = require('./onamebook.js');
//console.log('onamebook.onameIndex.length=', onamebook.onameIndex.length);
var _count = 253;
var _MAX_COUNT = onamebook.onameIndex.length;


var fs=require('fs');  
var path=require('path');  
const AV = require('leancloud-storage');

AV.init({
  appId: ' ',
  appKey: ' ',
});


function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(()=>{resolve();},ms);
  })
}


//alterFile('王');
//splitFile();
processNames();

function processNames(){
  if(_count < _MAX_COUNT )
  {
    console.log('===================================================', _count)
    storeLCDB(onamebook.onameIndex[_count]).then(()=>{
      _count++;
      sleep(2000).then(()=>processNames());
    })
  }
}


//////////////////////////////////////////////////////
function splitFile(){
  onamebook.onameIndex.forEach((value)=>{
    alterFile(value);
  })
}

////////////////////////////////////////////////////////////////////////////////////////
function alterFile(strName){
  //let strName = onamebook.onameIndex[0];
  let fn1 = './data/' + strName + '姓.txt';    // 查找的文件
  let fn2 = fn1 + '.txt';                 // 查找到之后改名
  let fn3 = fn1 + '.nul';                 // 查找不到，记录下来
  if ( fs.existsSync(fn1) ) {
    //fs.unlinkSync(fn);
    console.log(`${strName} >> 数据文件存在，改名为：${fn2}`);
    fs.renameSync(fn1, fn2);
  }else{
    console.log(`${strName} xxxx 数据文件不不不存在，记录：${fn2}`);
    fs.appendFileSync(fn3, '', 'utf-8');
  }
}

////////////////////////////////////////////////////////////////////////////////////
function storeLCDB(strName){
  return new Promise((resolve, reject) => {
    let Surname = AV.Object.extend('SurnameBook');
    let surname = new Surname();
    surname.set('surname', strName);
    
    let fn = './data/' + strName + '姓.txt.txt';
    console.log('storeLCDB=====================================', strName);
    let fileData='';
    if ( fs.existsSync(fn) ) {
      //fs.unlinkSync(fn);
      console.log(`${strName} >> 数据文件存在，读取文件：${fn}`);
      fileData =  fs.readFileSync(fn, {flag:'r+',encoding:'utf-8'});
      console.log(`${strName} >> 数据文件存在，内容长度=${fileData.length}`);
      surname.set('txtNote', fileData);
    }else{
      console.log(`${strName} xxxx 数据文件不不不存在，文件名：${fn}`);
      console.log(`${strName} xxxx 数据文件不不不存在，设置n/a标志！`);
      surname.set('dflag', 'n/a');      
    }
  
    surname.save().then(ret => {
      console.log('saveNoteData ret object.id=', ret.id);
      resolve();
    }).catch((err)=>{
      console.error(err);
      reject();
    })
  })  
}