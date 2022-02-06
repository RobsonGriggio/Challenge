const readline = require('readline')
const fs = require('fs')
const readable = fs.createReadStream('input.csv')
const  phoneUtil  =  require('google-libphonenumber').PhoneNumberUtil.getInstance()
var validator = require("email-validator")

const rl = readline.createInterface({
  input: readable,
})

let lineCounter = 0
let counterUser = 1
let result = []

const trueOrFalse = (element) => {
  if ((element == 1) || (element.toLowerCase() == "yes")) {
    return true
  } else{
    return false
  }
}

const repeatedPerson = (aux, array) => {
  if(aux == array[1]){
    counterUser++
    return array[1]
  }else{
    counterUser = 1
  }
}

const verifyEmail = (email) =>{
  if(validator.validate(email)){
    return true
  }else{
    return false
  }
}
const fixEmail = (email) =>{
  let regex = /[^a-z|@|.0-9]/gi
  email = email.replace(regex, "")
  return email
}

const verifyPhone = (number) => {
  if(phoneUtil.isValidNumber(number, "BR")){
    let formatedNumber = phoneUtil.formatOutOfCountryCallingNumber(number, "Brazilian")
    return formatedNumber
  }else{
    return false
  }
}

const fixNumber = (numberErr) =>{
  try {
    var fixNumber = numberErr.replace(/[^0-9-()]/g, "")
    var number = phoneUtil.parse(fixNumber, "BR")
    return number
  } catch (error) {
    number = phoneUtil.parse("00", "BR")
    return number
  }
}

const createPeople = (array, address) => {
  return {
    fullname: array[0],
    eid: array[1],
    groups: 
      array[8].split("/").concat(array[9].split("/"))
    ,
    addresses: address,
    invisible: trueOrFalse(array[10]),
    see_all: trueOrFalse(array[11])
  }
}


const createAdress = (array) =>{
  let adressFinal = []
  
  let fixedEmail = fixEmail(array[2])
  if(verifyEmail(fixedEmail)){
    adressFinal.push({
      type: "email",
      tags: [
        "Students"
      ],
      address: fixedEmail
    })
  }
  let fixedNumber = fixNumber(array[3])
  if((verifyPhone(fixedNumber))){
    adressFinal.push({
      type: "phone",
      tags: [
        "Students",
      ],
      address: verifyPhone(fixedNumber)
    })
  }
  fixedEmail = fixEmail(array[4])
  if(verifyEmail(fixedEmail)){
    adressFinal.push({
      type: "email",
      tags: [
        "Pedagogical",
        "Responsible"
      ],
      address: fixedEmail
    })
  }
  fixedNumber = fixNumber(array[5])
  if(verifyPhone(fixedNumber)){
    adressFinal.push({
      type: "phone",
      tags: [
        "Pedagogical",
        "Responsible"
      ],
      address: verifyPhone(fixedNumber)
    })
  }
  fixedEmail = fixEmail(array[6])
  if(verifyEmail(fixedEmail)){
    adressFinal.push({
      type: "email",
      tags: [
        "Financial",
        "Responsible"
      ],
      address: fixedEmail
    })
  }
  fixedNumber = fixNumber(array[7])
  if(verifyPhone(fixedNumber)){
    adressFinal.push({
      type: "phone",
      tags: [
        "Financial",
        "Responsible"
      ],
      address: verifyPhone(fixedNumber)
    })
  }
  return adressFinal
}

rl.on('line',async (line) =>{
  let aux
  let array = line.split(",")
  let adress = createAdress(array)
  if(lineCounter >= 1){
    if(lineCounter == 2){
      aux = array[1]
    }
    
    const indexOriginalPeople = result.findIndex(element => element.eid === repeatedPerson(aux, array))
    if(indexOriginalPeople > -1){
      adress.forEach(element => {
        const indexAdress = result[indexOriginalPeople].addresses.findIndex(value => value.adress == element.address)
        if(indexAdress == -1){
          result[indexOriginalPeople].addresses = result[indexOriginalPeople].addresses.concat(element)
        }
      })
      const repeatedPersonObj = await createPeople(array, adress)
      repeatedPersonObj && repeatedPersonObj.groups.forEach(element => {
        const indexGroups = result[indexOriginalPeople].groups.findIndex(value => value == element)
        if(indexGroups == -1){
          result[indexOriginalPeople].groups = result[indexOriginalPeople].groups.concat(element)
        }
      })
    }
    
    if(counterUser == 1 && indexOriginalPeople == -1){
      result.push(createPeople(array, adress))
    }
    
  }
  lineCounter++

  let outputFilename = "output.json"
  
  fs.writeFile(outputFilename, JSON.stringify(result, null, 4), function(err) {
    if(err) {
      console.log(err);
    }
  })
})

