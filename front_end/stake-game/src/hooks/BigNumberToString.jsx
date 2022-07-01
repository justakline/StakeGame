


const BigNumberToString = (balance) => {




var converted = balance?.toString()
var convertedNumb = 0
const length = converted.length;

//If the number is greater than 1.0 do this
if(length>18){
    converted = converted?.substring(0, 7)
    convertedNumb = converted.substring(0,length-18) + "."+ converted.substring(length-18, length)

}else{//smaller than 1 so we add 0's
    converted =converted?.substring(0, 7)
    convertedNumb = "0." + "0".repeat(18-length) +converted

}


//If there are too many 0's after the last non-0 number... 0.0300000, then remove the extra 0.s
for(let i =convertedNumb.length-1; i>=0; i--){
    if(convertedNumb.charAt(i)!=0){
        break;
    }else{
        convertedNumb=convertedNumb.substring(0,i);
    }
}

//If the number was a whole number, ie after doing the last thing it goes from 5.000 to 5., remove the .
if(convertedNumb.charAt(convertedNumb.length-1) == "."){
    convertedNumb = convertedNumb.substring(0, convertedNumb.length-1)
}

  
//   var convertedNumb = converted
//   console.log(convertedNumb)
    
return convertedNumb;
// return 0;
  
    // return null;

}


export default BigNumberToString;