const getV=require('./getV')
function getSameW(x,y,grayData) {
  const v=getV(x,y,grayData)
  let w=1;
  while (v===getV(x+w,y,grayData)){
    w++;
  }
  return w;
}
function getLineArrByGrayData(grayData) {
  console.time('getLineArrByGrayData')
  const lData=[];//线条数据
  let preStart=0;
  let preEnd=0;
  let xLen=0;

  //点转成线条、area
  for (let y = 0; y < grayData.height; y++) {
    xLen=0;
    for (let x = 0; x < grayData.width; x++) {
      xLen++;
      const li=lData.length;
      const w=getSameW(x,y,grayData);
      const v=getV(x,y,grayData);

      const obj={
        x,y,w,v,
        area:{
          hw:w,
          len:1,
          isBg:0,
          s:li,
          e:li,
          pos:[x,y,x+w,y+1],
        }
      };
      lData.push(obj)
      //区域合并
      for(let i=preStart;i<preEnd;i++){
        const p=lData[i]
        if(p.x>x+w){
          break
        }else if(p.x+p.w<x){

        }else if(obj.area!==p.area){
          if(v===p.v){
            let area1;
            let area2;
            if(obj.area.s<p.area.s){
              area1=p.area
              area2=obj.area;
            }else{
              area1=obj.area
              area2=p.area;
            }
            area2.pos[0]=Math.min(area1.pos[0],area2.pos[0])
            area2.pos[2]=Math.max(area1.pos[2],area2.pos[2])

            if(area1.e>area2.e){
              area2.e=area1.e
              area2.pos[3]=area1.pos[3]
            }
            area2.hw+=area1.hw;
            area2.len+=area1.len;
            for(let d=area1.s;d<=area1.e;d++){
              if(lData[d].area===area1){
                lData[d].area=area2
              }
            }

          }
        }
      }

      x=x+w-1
    }
    preStart=preEnd;
    preEnd=preEnd+xLen
  }

  //判断是否背景
  //求相连的文字区域
  const posArr=[]
  let tempArr=[]
  lData.forEach(function(line,index){
    const {x,y,w,v,area}=line;
    //isBg 0文字1线条2背景3文字内背景
    if(index===area.s){
      const width=area.pos[2]-area.pos[0]
      const height=area.pos[3]-area.pos[1]

      if(area.hw>300||area.len>100||width>32&&height>32||width>50*height||height>50*width){
        area.isBg=1;
      }else if(index>0&&lData[index-1].y===y){
        const preLine=lData[index-1];
        if(area.hw>100&&preLine.area.hw>300){
          area.isBg=2;
        }else{
          if(preLine.area.isBg===0){
            const bgLine=lData[preLine.area.pos[4]];
            if(bgLine&&bgLine.v===v&&bgLine.area.e>area.e){
              area.isBg=3
              area.s=bgLine.area.s
              area.e=bgLine.area.e
            }else{
              area.pos[4]=preLine.area.pos[4]
            }
          }else{
            area.pos[4]=preLine.area.s
          }
        }
      }
      if(!area.isBg){
        let pos1=area.pos;
        let has=true;
        for(let d=tempArr.length-1;d>=0;d--){
          const pos2=tempArr[d];
          if(pos1[1]-pos2[3]>3){
            tempArr.splice(d,1)
          }else if(pos1[4]===pos2[4]&&!(pos1[0]>pos2[2]+6||pos1[2]+6<pos2[0])){
            pos2[0]=Math.min(pos1[0],pos2[0])
            pos2[2]=Math.max(pos1[2],pos2[2])
            pos2[3]=Math.max(pos1[3],pos2[3])
            if(!has){
              tempArr.splice(tempArr.indexOf(pos1),1)
              posArr.splice(posArr.indexOf(pos1),1)
            }else{
              has=false
            }
            pos1=pos2;
          }
        }
        if(has){
          tempArr.push(pos1)
          posArr.push(pos1)
        }
      }
    }
    if(area.isBg){
      const k=grayData.width*y
      for(let i=x;i<x+w;i++){
        grayData.data[k+i]=undefined;
      }
    }
  })
  //求行区域 背景相同
  const rectArr=[]
  tempArr=[]
  posArr.forEach(function (pos1) {
    const w1=pos1[2]-pos1[0]
    const h1=pos1[3]-pos1[1]
    //是否二、三
    pos1[5]=w1>2*h1&&h1<5&&w1<50?1:0;

    let has=true;
    for(let d=tempArr.length-1;d>=0;d--){
      const pos2=tempArr[d];
      if(pos1[1]-pos2[3]>20){
        tempArr.splice(d,1)
      }else if(pos1[1]-pos2[3]>4&&pos1[5]===0&&pos2[5]===0){
        tempArr.splice(d,1)
      }else if(!(pos1[0]>pos2[2]||pos1[2]<pos2[0])&&(pos1[4]===pos2[4]||pos1[1]<pos2[3])){
        pos2[0]=Math.min(pos1[0],pos2[0])
        pos2[2]=Math.max(pos1[2],pos2[2])
        pos2[3]=Math.max(pos1[3],pos2[3])
        pos2[5]=0;
        if(!has){
          tempArr.splice(tempArr.indexOf(pos1),1)
          rectArr.splice(rectArr.indexOf(pos1),1)
        }else{
          has=false
        }
        pos1=pos2;
      }
    }
    if(has){
      tempArr.push(pos1)
      rectArr.push(pos1)
    }
  })
  console.timeEnd('getLineArrByGrayData')

  rectArr.sort(function (pos1,pos2) {
    if(pos1[1]>pos2[3]){
      return 1
    }else if(pos2[1]>pos1[3]){
      return -1
    }else{
      return pos1[0]-pos2[0];
    }
  })
  return rectArr;
}
module.exports=getLineArrByGrayData