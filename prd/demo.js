const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('../develop/getGrayData')
const getV=require('../develop/getV')
const getLineArrByGrayData=require('../develop/getLineArrByGrayData')
const getStrByNum=require('../develop/getStrByNum')
const {sortAdd,sortFind}=require('../develop/sortAdd')
const {getTz,getTzY,getTzArr}=require('../develop/tzCommon')
const {renderTextInit,renderTextToImageData}=require('../develop/renderTextToImageData')
const mekflink=require('./mekflink')
renderTextInit()
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

function setOpacity(grayData,imageData) {
  for (let y = 0; y < grayData.height; y++) {
    for (let x = 0; x < grayData.width; x++) {
      const v=getV(x,y,grayData)
      if(v===undefined){
        changeV2(x,y,imageData)
      }else{
        changeV3(x,y,imageData)
      }
    }
  }
}
function showRect(pos1,imageData) {
  const [x1,y1,x2,y2]=pos1;
  for(let i=x1;i<=x2;i++){
    changeV1(i,y1,imageData)
    changeV1(i,y2,imageData)
  }
  for(let i=y1;i<=y2;i++){
    changeV1(x1,i,imageData)
    changeV1(x2,i,imageData)
  }
}
const prdMap=JSON.parse(fs.readFileSync('prdMap.json').toString())

function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}
prdMap.forEach(function ([key,val],i) {
  if(!Array.isArray(val)){
    mekflink.add(key,val)
  }else{
    val.forEach(function (arr) {
      mekflink.add(key,arr[1])
    })
  }
})
mekflink.makeGl()
function demo () {
  console.time('demo')
  const buff=fs.readFileSync('../data/test.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)
  //透明
  setOpacity(grayData,imageData)

  const tzArr=getTzArr(posArr,grayData)
  tzArr.forEach(function (tz,m) {
    const arr=mekflink.fastSolve(tz)
    console.log(arr)
    const pos1=posArr[m]
    showRect(pos1,imageData)
    const tarr=[]
    const tzarr=[]
    let i=0;
    let dArr=[];
    let preText='';
    while (i<tz.length){

      const arr=sortFind(tz,i,prdMap)
      let text='';
      if(arr&&arr[2]===0){
        const data=prdMap[arr[0]]
        if(Array.isArray(data[1])&&Array.isArray(data[1][0])){
          const key2=getTzY([pos1[0]+i,pos1[1],pos1[0]+i+arr[1],pos1[3]],grayData)
          const [n,len,dis]=data[1].sortFindLen(key2)
          if(dis===0){
            tarr.push(data[1][n][1])
          }
        }else if(Array.isArray(data[1])){
          //找出最近的
          let minNum;
          let minI;
          const preCode=preText.charCodeAt(0);
          for(let h=0;h<data[1].length;h++){
            const code=data[1][h].charCodeAt(0)
            const num=Math.abs(preCode-code);
            if(h===0){
              minNum=num;
              minI=h;
            }else if(num<minNum){
              minNum=num;
              minI=h;
            }
          }
          preText=data[1][minI]
          text=data[1][minI]
        }else{
          preText=data[1]
          text=data[1]
        }
      }
      if(text){
        if(dArr.length>0){
          tarr.push('');
          tzarr.push(dArr.join(''));
          dArr=[];
        }
        tarr.push(text)
        tzarr.push(tz.substr(i,arr[1]))
        i=i+arr[1];
      }else{
        dArr.push(tz[i]);
        if(i===tz.length-1&&dArr.length>0){
          tarr.push('');
          tzarr.push(dArr.join(''))
          dArr=[]
        }
        i++
      }
    }
    if(tarr.length>0){
      console.log(tarr,tzarr)
      // renderTextToImageData(tarr.join(''),pos1,imageData)
    }
  })
  console.timeEnd('demo')
  saveImageToFile(imageData,'demo2.png')
}

demo();