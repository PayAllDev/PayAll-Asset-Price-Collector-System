/*

-- PayAll System - SharedFunctions
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 29/10/2021
-- @Description: This file have multiple functions that are used by index.js
-- @Programming Language: Javascript

*/

let MonthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let LowerPricesOBJ = {};
let HigherPricesOBJ = {};
let HistorialDayState = {};

const chalk = require('chalk');

function ShowNotification(Style, Message) {

    //This function set Colors for multiple Notification depending on his state

    if (Style == null || Message == null) return

    switch (Style) {

        case "SystemStyle":
            console.log(chalk.cyan(Message))
            break

        case "SystemTitleStyle":
            console.log(chalk.yellowBright(Message))
            break

        case "Enter":
            console.log("")
            break

        case "Normal":
            console.log(chalk.whiteBright(Message))
            break

        case "NormalUpdateCoinGeck":
            console.log(chalk.yellow("  ^- [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] COINGECKOCLIENT-UPDATE:" + Message))
            break

        case "DBSaveUpdate":
            console.log(chalk.white("  ^- [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "]") + chalk.green(" SYSTEM-UPDATE:") + chalk.white(Message))
            break
        case "ERROR":
            console.log(chalk.red("  ^- [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] SYSTEM-UPDATE:" + Message))
            break

    }
}

function SetCompleteNumber(number) {

    //This function make that an number as 1 be "01"

    let numberComplete

    if (number.toString().length == 1) {

        numberComplete = '0' + number.toString()

    } else {
        numberComplete = number.toString()
    }

    return numberComplete


}

async function AnalyzePrices(CurrentElementISOCode, CurrentElementPrice) {

    //This function will analyze the current price with higher and lower price that must be in local in case don´t it take from DB

    let LastHigherPrices, LastLowerPrices


    LastHigherPrices = HigherPricesOBJ[CurrentElementISOCode]
    LastLowerPrices = LowerPricesOBJ[CurrentElementISOCode]

    if (LastHigherPrices == null) {

        LastHigherPrices = await GetLastHLPrice(CurrentElementISOCode, 'HigherPrice')

    }

    if (LastLowerPrices == null) {

        LastLowerPrices = await GetLastHLPrice(CurrentElementISOCode, 'LowerPrice')

    }    

    if (LastHigherPrices != 'Empty' && CurrentElementPrice > LastHigherPrices) {
        LastHigherPrices = CurrentElementPrice
    } else if (LastHigherPrices == 'Empty') {
        LastHigherPrices = CurrentElementPrice
    }

    if (LastLowerPrices != 'Empty' && CurrentElementPrice < LastLowerPrices) {
        LastLowerPrices = CurrentElementPrice
    } else if (LastLowerPrices == 'Empty') {
        LastLowerPrices = CurrentElementPrice
    }

    return new Promise((resolver, reject) => {
        resolver(LastHigherPrices + ',' + LastLowerPrices)

    })

}

function GetLastHLPrice(CurrentElementISOCode, CurrentElementType) {

    //This function will return the Higher and Lower Price for be analyzed

    return new Promise((resolver, reject) => {

        let DBRef = db.ref('System/RealtimeData/Crypto/MXN/' + CurrentElementType + '/' + CurrentElementISOCode)

        DBRef.once('value', (data) => {

            if (data.val() != null) {

                if (data.val() != '') {

                    resolver(data.val())

                } else {

                    resolver('Empty')

                }

            } else {
                resolver('Empty')
            }

        })

    })

}

function UpdateDBData(CurrentElementISOCode, CurrentElementPrice, CurrentElementType, CurrentPathtoSave) {

    //This function will save any data

    return new Promise((resolve, reject) => {

        if (CurrentElementISOCode == null || CurrentElementPrice == null || CurrentPathtoSave == null) reject('The data has been losted')

        let DBRefToUpdate = db.ref('System/RealtimeData/' + CurrentElementType + '/MXN/' + CurrentPathtoSave + '/')

        DBRefToUpdate.update({ [CurrentElementISOCode]: parseFloat(CurrentElementPrice) });

        resolve('Success')

    })
}

function UpdateDBHistorial(CurrentElementType, CurrentElementISOCode, CurrentElementPrice, CurrentElementHPrice, CurrentElementLPrice) {

    //This function will save the historial Price of Crypto Assets

    return new Promise((resolve, reject) => {

        if (CurrentElementType == null || CurrentElementISOCode == null || CurrentElementPrice == null || CurrentElementHPrice == null || CurrentElementLPrice == null) reject('The data has been losted')

        TodayHistorialState = HistorialDayState[CurrentElementISOCode]
        let DBRefHistorial = db.ref('System/ForexRecords/' + CurrentElementType + '/' + CurrentElementISOCode + '/MXN/' + TodayYear + '/' + SetCompleteNumber(TodayMonth) + '/' + SetCompleteNumber(TodayDay))

        let ElementCreateOBJ = { "o": parseFloat(CurrentElementPrice), "h": parseFloat(CurrentElementHPrice), "l": parseFloat(CurrentElementLPrice), "c": parseFloat(CurrentElementPrice), "x": SetCompleteNumber(TodayDay) + " " + MonthsName[TodayMonth - 1] + " " + TodayYear + " 00:00 GMT" }
        let ElementUpdateOBJ = { "h": parseFloat(CurrentElementHPrice), "l": parseFloat(CurrentElementLPrice), "c": parseFloat(CurrentElementPrice) }

        if (TodayHistorialState == null) {

            DBRefHistorial.once('value', (data) => {

                if (data.val() != null) {

                    Object.defineProperty(HistorialDayState, CurrentElementISOCode, { value: 'Created', writable: true, enumerable: true })
                    DBRefHistorial.update(ElementUpdateOBJ)
                    resolve('SuccessUpd')

                } else {
                    Object.defineProperty(HistorialDayState, CurrentElementISOCode, { value: 'Created', writable: true, enumerable: true })
                    DBRefHistorial.update(ElementCreateOBJ)
                    resolve('SuccessCre')
                }

            })

        } else {

            DBRefHistorial.update(ElementUpdateOBJ)
            resolve('SuccessUpd')

        }

    })
}

function SaveNewHistorialData(CurrentElementISOCode, CurrentElementPrice, CurrentElementType) {

    return new Promise((resolve, reject) => {

        if(CurrentElementISOCode == null || CurrentElementPrice == null || CurrentElementType == null) reject('Data lost')

        HistorialDayState = {}

        let DBRefNewHistorial = db.ref('System/ForexRecords/' + CurrentElementType + '/' + CurrentElementISOCode + '/MXN/' + TodayYear + '/' + SetCompleteNumber(TodayMonth) + '/' + SetCompleteNumber(TodayDay))

        let NewElementHistorialOBJ = { 
            "o": parseFloat(CurrentElementPrice), 
            "h": parseFloat(CurrentElementPrice), 
            "l": parseFloat(CurrentElementPrice), 
            "c": parseFloat(CurrentElementPrice), 
            "x": SetCompleteNumber(TodayDay) + " " + MonthsName[TodayMonth - 1] + " " + TodayYear + " 00:00 GMT" 
        }

        DBRefNewHistorial.update(NewElementHistorialOBJ)

        Object.defineProperty(HistorialDayState, CurrentElementISOCode, { value: 'Created', writable: true, enumerable: true })
        resolve('Success')

    })

}

function SetNewHLPrices(CurrentElementISOCode, CurrentElementPrice, CurrentElementType) {

    return new Promise((resolve, reject) => {

        if(CurrentElementISOCode == null || CurrentElementPrice == null || CurrentElementType == null) reject('Data lost')

        HigherPricesOBJ = {}
        LowerPricesOBJ = {}

        let DBRefHigherPrice = db.ref('System/RealtimeData/' + CurrentElementType + '/MXN/HigherPrice/')
        let DBRefLowerPrice = db.ref('System/RealtimeData/' + CurrentElementType + '/MXN/LowerPrice/')

        DBRefHigherPrice.update({ [CurrentElementISOCode]: parseFloat(CurrentElementPrice) });
        DBRefLowerPrice.update({ [CurrentElementISOCode]: parseFloat(CurrentElementPrice) });

        resolve('Success')

    })

}

module.exports = {

    "ShowNotification": ShowNotification,
    "SetCompleteNumber": SetCompleteNumber,
    "AnalyzePrices": AnalyzePrices,
    "UpdateDBData": UpdateDBData,
    "UpdateDBHistorial": UpdateDBHistorial,
    "SaveNewHistorialData":SaveNewHistorialData,
    "SetNewHLPrices":SetNewHLPrices,
    "LowerPricesOBJ":LowerPricesOBJ,
    "HigherPricesOBJ":HigherPricesOBJ,
    "HistorialDayState":HistorialDayState

}