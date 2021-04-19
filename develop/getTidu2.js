const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('./getGrayData')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getStrByNum=require('./getStrByNum')
const getTextArr=require('./getTextArr')
const sortAdd=require('./sortAdd')
const renderTextToImageData=require('./renderTextToImageData')
// const mekflink=require('./mekflink')

function changeV(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=0;
  imageData.data[k+1]=0;
  imageData.data[k+2]=0;
  imageData.data[k+3]=255;
}
function changeV1(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  // if(imageData.data[k+3]===0){
    imageData.data[k]=255;
    imageData.data[k+1]=0;
    imageData.data[k+2]=0;
    imageData.data[k+3]=255;
  // }

}
function changeV2(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=255;
  imageData.data[k+1]=255;
  imageData.data[k+2]=255;
  imageData.data[k+3]=0;
}
function changeV3(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=0;
  imageData.data[k+1]=0;
  imageData.data[k+2]=255;
  imageData.data[k+3]=255;
}



// for (let y = 0; y < grayData.height; y++) {
//   for (let x = 0; x < grayData.width; x++) {
//     const v=getV(x,y,grayData)
//     if(v===undefined){
//       changeV2(x,y,imageData)
//     }
//   }
// }
function getSameH(x,y,grayData) {
  let h=1;
  while (getV(x,y+h,grayData)!==undefined){
    h++;
  }
  return h;
}
function getSameW(x,y,grayData) {
  let h=1;
  while (getV(x+h,y,grayData)!==undefined){
    h++;
  }
  return h;
}
function getTzArr (posArr,grayData) {
  const tzArr=[]
  posArr.forEach(function (pos1,i) {
    const tz=getTz(pos1,grayData)
    tzArr.push(tz)
  })
  return tzArr;
}
function getTz (pos1,grayData) {
  const [x1, y1, x2, y2] = pos1
  const h1 = y2 - y1
  if (h1 < 50) {
    const fArr = [];
    for (let x = x1; x < x2; x++) {
      let hu = 0;
      let allY = 0;

      for (let y = y1; y < y2; y++) {
        const v = getV(x, y, grayData)
        if (v !== undefined) {
          allY = allY + y
          hu++;
        }
      }
      let add = 0
      if (2 * allY > hu * (y1 + y2 - 1)) {
        add = 10;
      }
      fArr.push(getStrByNum(hu));
    }
    return fArr.join('');
  }
}
/*
textArr 文字库
tzArr 特征
rectArr 文字数据
 */
let oneMap=[]
if(!fs.existsSync('oneMap.json')){
  const buff=fs.readFileSync('./Arial.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)

  let index=0;
  const textArr=getTextArr();
  const wzAllArr=[]
  const tzAllArr=[]
  posArr.forEach(function (pos1,i) {
    const tz=getTz(pos1,grayData)
    tzAllArr.push(tz)
    wzAllArr.push(textArr[index])
    index++;
    if(index===textArr.length){
      index=0;
    }
  })

  tzAllArr.forEach(function (key,i) {
    const val=wzAllArr[i];
    sortAdd(key,val,oneMap)
  })

  fs.writeFileSync('oneMap.json',JSON.stringify(oneMap))

}else{
  oneMap=JSON.parse(fs.readFileSync('oneMap.json').toString())
}


function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}

function demo () {
  const buff=fs.readFileSync('./test.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)
  //透明
  for (let y = 0; y < grayData.height; y++) {
    for (let x = 0; x < grayData.width; x++) {
      const v=getV(x,y,grayData)
      if(v===undefined){
        changeV2(x,y,imageData)
      }
    }
  }

  const tzArr=getTzArr(posArr,grayData)
  tzArr.forEach(function (tz,m) {
    const arr=[]
    const darr=[]
    let i=0;
    let pre=0;
    let d='';
    while (i<tz.length){
      const [n,len,dis]=oneMap.sortFindLen(tz,i)
      const obj=oneMap[n]
      if(len===obj.key.length){
        if(d){
          arr.push(d)
          d=''
        }
        arr.push(obj.data[0])

        pre=i;
        i=i+len;
      }else{
        if(i-pre>1){
          if(d){
            arr.push(d)
          }
          d=tz[i];
        }else{
          d=d+tz[i];
          if(i===tz.length-1){
            arr.push(d)
          }
        }
        pre=i;
        i++
      }
    }

    const pos1=posArr[m]
    // renderTextToImageData(arr,pos1,imageData)

    if(arr.length>0){
      console.log(arr)
    }
  })

  saveImageToFile(imageData,'demo2.png')
}

demo();