/*

-- PayAll System - SharedFunctions
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 20/10/2021
-- @Description: This file have multiple functions that are used by index.js
-- @Programming Language: Javascript

*/

const chalk = require('chalk');

let LowerPricesOBJ = {};
let HigherPricesOBJ = {};

function ShowNotification(Style, Message) {

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

        case "NormalUpdate":
            console.log(chalk.white(" [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] SYSTEM-UPDATE:" + Message))
            break

        case "DBSaveUpdate":
            console.log(chalk.white("[" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "]") + chalk.green(" SYSTEM-UPDATE: ") + chalk.white(Message))
            break

        case "ERROR":
            console.log(chalk.red(" [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] SYSTEM-UPDATE:" + Message))
            break

    }
}

function SetCompleteNumber(number) {

    let numberComplete

    if (number.toString().length == 1) {

        numberComplete = '0' + number.toString()

    } else {
        numberComplete = number.toString()
    }

    return numberComplete


}

async function AnalyzePrices(CurrentElementISOCode, CurrentElementPrice) {

    let LastHigherPrices, LastLowerPrices


    LastHigherPrices = HigherPricesOBJ[CurrentElementISOCode]
    LastLowerPrices = LowerPricesOBJ[CurrentElementISOCode]

    ShowNotification('Enter','Enter')
    console.log(CurrentElementISOCode)

    if (LastHigherPrices == null) {
        
        LastHigherPrices = await GetLastHLPrice(CurrentElementISOCode, 'HigherPrice')

    }

    if(LastLowerPrices == null) {

        LastLowerPrices = await GetLastHLPrice(CurrentElementISOCode, 'LowerPrice')

    }

    console.log('AnalyzePricesDB: ' + LastHigherPrices)
    console.log('AnalyzePricesDB: ' + LastLowerPrices)

    if(LastHigherPrices != 'Empty' && CurrentElementPrice > LastHigherPrices){
        LastHigherPrices = CurrentElementPrice
    }

    if(LastLowerPrices != 'Empty' && CurrentElementPrice < LastLowerPrices){
        LastLowerPrices = CurrentElementPrice
    }

    console.log('AnalyzePricesAnalyzed: ' + LastHigherPrices)
    console.log('AnalyzePricesAnalyzed: ' + LastLowerPrices)

    return new Promise((resolver,reject) => {
        resolver('termina')
        
    })

}

function GetLastHLPrice(CurrentElementISOCode, CurrentElementType) {

    return new Promise((resolver, reject) => {

        let DBRef = db.ref('System/RealtimeData/Crypto/MXN/' + CurrentElementType + '/' + CurrentElementISOCode)

        DBRef.once('value', (data) => {

            if (data.val() != null) {

                if(data.val() != ''){
                    resolver(data.val())
                }else{
                    resolver('Empty')    
                }

            } else {
                resolver('Empty')
            }

        })

    })

}

module.exports = {

    "ShowNotification": ShowNotification,
    "SetCompleteNumber": SetCompleteNumber,
    "AnalyzePrices": AnalyzePrices

}