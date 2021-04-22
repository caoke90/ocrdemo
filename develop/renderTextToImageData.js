const getGrayData=require('./getGrayData')
const PNG = require("pngjs").PNG;
const fs=require('fs')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getTextArr=require('./getTextArr')

const textArr=getTextArr();
const dataMap={};
function setColor(v,x,y,imageData) {
  const k=4*imageData.width*y+4*x;
  imageData.data[k]=255;
  imageData.data[k+1]=v;
  imageData.data[k+2]=v;
  imageData.data[k+3]=255;
}
function renderTextInit() {
  const buff=fs.readFileSync('../data/Arial12.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)

  posArr.forEach(function (pos1,i) {
    const [x1,y1,x2,y2]=pos1
    const rect={
      width:x2-x1,
      height:y2-y1,
      data:[]
    }
    for(let y=y1;y<y2;y++){
      for(let x=x1;x<x2;x++){
        const v=getV(x,y,grayData)
        if(v!==undefined){
          rect.data.push(v)
        }else{
          rect.data.push(v)
        }
      }
    }
    dataMap[textArr[i]]=rect;
  })
}

function renderTextToImageData(text,pos,imageData) {
  let x1=pos[0]
  let y1=pos[1]-5
  for(let i=0;i<text.length;i++){
    const rect=dataMap[text[i]];
    for(let y=0;y<rect.height;y++){
      for(let x=0;x<rect.width;x++){
        const v=rect.data[rect.width*y+x];
        if(v!==undefined){
          setColor(v*5,x1+x,y1+y,imageData);
        }
      }
    }
    x1=x1+rect.width+1;
  }
  return imageData;
}

module.exports={renderTextInit,renderTextToImageData}

// posArr.forEach(function (pos1,i) {
//   renderTextToImageData(textArr[i], pos1, imageData)
// })
//
// fs.writeFileSync('demo.png',PNG.sync.write(imageData, {filterType: 4}))