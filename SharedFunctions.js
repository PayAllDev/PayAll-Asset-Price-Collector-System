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

        case "NormalUpdateCoinGeck":
            console.log(chalk.yellow("  ^- [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] COINGECKOCLIENT-UPDATE:" + Message))
            break

        case "DBSaveUpdate":
            console.log(chalk.white("  ^- [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "]") + chalk.green(" SYSTEM-UPDATE:") + chalk.white(Message))
            break

        case "ERROR":
            console.log(chalk.red("  ^-  [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] SYSTEM-UPDATE:" + Message))
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

function UpdateDBData(CurrentElementISOCode, CurrentElementPrice, CurrentPathtoSave) {

    return new Promise((resolve, reject) => {

        if (CurrentElementISOCode == null || CurrentElementPrice == null || CurrentPathtoSave == null) reject('The data has been losted')

        let DBRefToUpdate = db.ref('System/RealtimeData/Crypto/MXN/' + CurrentPathtoSave + '/')
        let DBRefToUpdateCheck = db.ref('System/RealtimeData/Crypto/MXN/' + CurrentPathtoSave + '/' + CurrentElementISOCode)

        DBRefToUpdate.update({ [CurrentElementISOCode]: parseFloat(CurrentElementPrice) });

        DBRefToUpdateCheck.once('value', (data) => {

            let GlobalDataStateRef = db.ref('System/RealtimeStatus/Crypto/MXN/' + CurrentPathtoSave + '/' + CurrentElementISOCode)

            if (data.val() != null && data.val() == CurrentElementPrice) {

                GlobalDataStateRef.update({ [CurrentElementISOCode]: 'Enable' });
                resolve('Success')

            } else if (data.val() != null && data.val() != CurrentElementPrice) {

                GlobalDataStateRef.update({ [CurrentElementISOCode]: 'UsingLast' });
                resolve('Error')    


            } else if (data.val() == null || data.val() == "") {

                GlobalDataStateRef.update({ [CurrentElementISOCode]: 'Disble' });
                resolve('Error')

            }


        });

    })
}

module.exports = {

    "ShowNotification": ShowNotification,
    "SetCompleteNumber": SetCompleteNumber,
    "AnalyzePrices": AnalyzePrices,
    "UpdateDBData": UpdateDBData

}