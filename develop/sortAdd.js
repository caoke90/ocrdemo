//比较两字符的大小、相等长度、是否包含
function compareLen(str1,str2,n1=0,n2=0) {
  //求出相等部分
  let len=0;
  let dis=-2;
  while (dis===-2){
    const l1=n1+len
    const l2=n2+len
    if(l1<str1.length&&l2<str2.length&&str1.charCodeAt(l1)===str2.charCodeAt(l2)){
      len++;
    }else if(l1===str1.length&&l2===str2.length){
      dis=0;
    }else if(l1===str1.length){
      dis=-1
    }else if(l2===str2.length){
      dis=1
    }else{
      if(str1.charCodeAt(l1)>str2.charCodeAt(l2)){
        dis=1
      }else{
        dis=-1
      }
    }
  }
  return [dis,len]
}


//查找字符在数组的最大相等长度和大小
function findLen(str,hasSortArr,callback) {
  var l=0,r=hasSortArr.length;
  var lock=-1;
  var len1=0,len2=0;
  var len=0,dis=0;
  if(hasSortArr.length>0){
    [dis,len1]=callback(str,hasSortArr[0]);
    if(dis<1){
      return [0,len1,dis]
    }
    [dis,len2]=callback(str,hasSortArr[r-1]);
    if(dis>-1){
      return [r-1,len2,dis]
    }
    while(lock===-1){
      var m=(l+r+1)>>1;
      //比较下坐标大小
      [dis,len]=callback(str,hasSortArr[m])

      if(dis===1){
        if(m+1===r){
          if(len<len2){
            lock=r;
            len=len2;
            dis=-1
          }else{
            lock=m;
          }
        }else{
          len1=len;
          l=m
        }
      }else if(dis===-1){
        if(l+1===m){
          if(len<len1){
            lock=l;
            len=len1;
            dis=1
          }else{
            lock=m;
          }
        }else{
          len2=len;
          r=m
        }
      }else{
        lock=m;
      }
    }
    return [lock,len,dis]
  }
  return [lock,0,1]
}

//[n,len,dis]
Array.prototype.sortFindLen=function(key,n1=0,n2=0){
  return findLen(key,this,function (str1,obj) {
    return compareLen(str1,obj[0],n1,n2)
  })
}
function findKey2(key2,data) {
  let index=-1;
  for(let i=0;i<data.length;i++){
    if(data[i][0]===key2){
      index=i;
      break
    }
  }
  return index
}
function findKey2AndVal(key2,val,data) {
  let index=-1;
  for(let i=0;i<data.length;i++){
    if(data[i][1]===key2&&data[i][0]===val){
      index=i;
      break
    }
  }
  return index
}
//添加字符到排序数组中
function sortAdd(key,key2,val,dataMap){
  const [n,len,dis]=dataMap.sortFindLen(key)
  if(dis===1){
    dataMap.splice(n+1,0,[key,[[key2,val]]])
  }else if(dis===-1){
    dataMap.splice(n,0,[key,[[key2,val]]])
  }else{
    const data=dataMap[n][1];
    const [n2,len2,dis2]=data.sortFindLen(key2);
    if(dis2===1){
      data.splice(n2+1,0,[key2,val])
    }else if(dis2===-1){
      data.splice(n2,0,[key2,val])
    }else{
      if(Array.isArray(data[n2][1])){
        if(data[n2][1].indexOf(val)===-1){
          data[n2][1].push(val)
        }
      }else if(data[n2][1]!==val){
        data[n2][1]=[data[n2][1],val]
        console.log(data[n2][1])
      }
    }
  }
}

function sortFind(str,i,dataMap){
  const [n,len,dis]=dataMap.sortFindLen(str,i)
  if(dis===1){
    if(len===dataMap[n][0].length){
      return [n,len,0]
    }else{
      let m=n-1;
      while (m>-1&&dataMap[m][0].length>len) {
        m--
      }
      if(m>-1&&dataMap[m][0].length===len&&dataMap[m][0][dataMap[m][0].length-1]===str[i+len-1]){
        return [m,len,0]
      }
    }
  }
  return [n,len,dis];
}

// const arr=[]
// sortAdd('110','12',arr)
// sortAdd('1112','12',arr)
// sortAdd('1113','12',arr)
//
// console.log(arr)
//
// sortFind('111412',0,arr)
module.exports={
  sortAdd,sortFind
}

