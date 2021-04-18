//比较两字符的相等长度和大小
function compareLen(n1,n2,str1,str2) {
  //求出相等部分
  var len=0;
  while (n1+len<=str1.length&&n2+len<=str2.length&&str1.charCodeAt(n1+len)===str2.charCodeAt(n2+len)){
    len++;
  }
  var code1=str1.charCodeAt(n1+len);
  var code2=str2.charCodeAt(n2+len);

  if(Number.isNaN(code1)&&Number.isNaN(code2)){
    return [len,0]
  }else if(Number.isNaN(code1)){
    return [len,-1]
  }else if(Number.isNaN(code2)){
    return [len,1]
  }else{
    //求出大小
    var dis=0;
    if(code1<code2){
      dis=-1
    }else if(code1>code2){
      dis=1
    }
    if(str1.substr(n1,len)!==str2.substr(n2,len)){
      console.log(dis,len,str1.substr(n1,len),'===',str2.substr(n2,len),n1,n2,str1.length,str2.length)
    }

    return [len,dis];
  }
}
//查找字符在数组的最大相等长度和大小
function findLen(str,hasSortArr,callback) {
  var l=0,r=hasSortArr.length;
  var lock=-1;
  var len1=0,len2=0;
  var len=0,dis=0;

  if(hasSortArr.length>0){
    [len1,dis]=callback(str,hasSortArr[0]);
    if(dis<1){
      return [0,len1,dis]
    }
    [len2,dis]=callback(str,hasSortArr[r-1]);
    if(dis>-1){
      return [r-1,len2,dis]
    }
    while(lock===-1){
      var m=(l+r+1)>>1;
      //比较下坐标大小
      [len,dis]=callback(str,hasSortArr[m])
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
Array.prototype.sortFindLen=function(str){
  return findLen(str,this,function (str1,str2) {
    return compareLen(0,0,str1,str2)
  })
}
//添加字符到排序数组中
Array.prototype.sortAdd=function(str){

  if(typeof str==='string'){
    const [n,len,dis]=this.sortFindLen(str)
    if(dis===1){
      if(n!==-1&&len===this[n].length){
        this.splice(n,1,str)
      }else{
        this.splice(n+1,0,str)
      }
    }else if(dis===-1){
      if(len!==str.length){
        this.splice(n,0,str)
      }
    }
  }
}

// const arr=['11','21']
// arr.sortAdd('1')
// arr.sortAdd('111')
// arr.sortAdd('0')
// arr.sortAdd('3')
// console.log(arr)