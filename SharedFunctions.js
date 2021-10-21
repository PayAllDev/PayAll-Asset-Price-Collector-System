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
const admin = require("firebase-admin");

let CryptoEnableISOCode, CryptoEnableName, CurrencyEnableISOCode, CurrencyEnableName, CryptoEnableID
let UserSystemTest = 'askdjalskdjas'

function LoadPayAllSystem() {

    ShowNotification('Enter', 'Enter')
    ShowNotification('Enter', 'Enter')
    ShowNotification('SystemStyle', "██████╗  █████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ")
    ShowNotification('SystemStyle', "██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ")
    ShowNotification('SystemStyle', "██████╔╝███████║ ╚████╔╝ ███████║██║     ██║     ")
    ShowNotification('SystemStyle', "██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██║██║     ██║     ")
    ShowNotification('SystemStyle', "██║     ██║  ██║   ██║   ██║  ██║███████╗███████╗")
    ShowNotification('SystemStyle', "╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝")
    ShowNotification('Enter', 'Enter')
    ShowNotification('SystemStyle', "Payall System Crypto Prices Collector System - Version: 2.2.0 ( ^^^^ )")
    ShowNotification('Enter', 'Enter')
    ShowNotification('SystemTitleStyle', " ****************** Initializing Global Functions")
    SetFirebaseConexion()
    .then((state) => {
        ShowNotification('Normal', "  ^- " + state)
        GetAssetsEnable('Init')
    })
    initClock('Init')
    //InitPayAllSystem()

}

function SetFirebaseConexion() {

    return new Promise((resolve,reject) => {

        var serviceAccount = require("./pa_sdk_key.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://payall-p404-default-rtdb.firebaseio.com" });
        db = admin.database();
        resolve('The firebase conecction has been crated succesfully')

    })    

}

function initClock(State) {

    let ClockDate = new Date()

    TodayYear = ClockDate.getFullYear()
    TodayMonth = ClockDate.getMonth() + 1
    TodayDay = ClockDate.getDate()
    TodayHours = ClockDate.getHours()
    TodayMinutes = ClockDate.getMinutes()
    TodaySeconds = ClockDate.getSeconds()

    TodayMonth = SetCompleteNumber(TodayMonth)
    TodayDay = SetCompleteNumber(TodayDay)

    if (State == 'Init') {
        ShowNotification('Normal', "  ^- The clock has been initialized successfully at: " + TodayHours + ':' + TodayMinutes + ':' + TodaySeconds)
    }

    if (TodayHours == 23 && TodayMinutes == 59 && TodaySeconds == 59) {


        let LowerPricesOBJ = {};
        let HigherPricesOBJ = {};
        saveNewHLPrice()
        ShowNotification('Normal', "  ^- The highest and lowest price have been reset at: " + TodayHours + ':' + TodayMinutes + ':' + TodaySeconds)

    }

    setTimeout(initClock, 1000);

}

function GetAssetsEnable2(State) {

    return new Promise((resolve, reject) => {

        let GlobalDataRef = db.ref('System/GlobalData/ActiveElements')

        GlobalDataRef.on('value', (snapshot) => {

            if (snapshot.val() != null) {

                ActiveElementsResponse = snapshot.val()

                CryptoEnableISOCode = ActiveElementsResponse.CryptosEnableISOCode.split(',')
                CryptoEnableName = ActiveElementsResponse.CryptosEnableName.split(',')

                CurrencyEnableISOCode = ActiveElementsResponse.CurrencysEnableISOCode.split(',')
                CurrencyEnableName = ActiveElementsResponse.CurrencysEnableName.split(',')

                CryptoEnableID = ActiveElementsResponse.CryptoEnableID.split(',')

                if (State == 'Init') {
                    ShowNotification('Normal', "  ^- The Enable Crypto´s ISO Code has been loaded succesfully: " + CryptoEnableISOCode.toString())
                    ShowNotification('Normal', "  ^- The Enable Crypto´s ID has been loaded succesfully: " + CryptoEnableID.toString())
                    ShowNotification('Normal', "  ^- The Enable Currency´s ISO Code has been loaded succesfully: " + CurrencyEnableISOCode.toString())
                }

            }

        }, (errorObject) => {

            reject(new Error('Could not get firebase current assets enable'))

        });
    })

}

function GetAssetsEnable(State) {

    let GlobalDataRef = db.ref('System/GlobalData/ActiveElements')

    GlobalDataRef.on('value', (snapshot) => {

        if (snapshot.val() != null) {

            ActiveElementsResponse = snapshot.val()

            CryptoEnableISOCode = ActiveElementsResponse.CryptosEnableISOCode.split(',')
            CryptoEnableName = ActiveElementsResponse.CryptosEnableName.split(',')

            CurrencyEnableISOCode = ActiveElementsResponse.CurrencysEnableISOCode.split(',')
            CurrencyEnableName = ActiveElementsResponse.CurrencysEnableName.split(',')

            CryptoEnableID = ActiveElementsResponse.CryptoEnableID.split(',')

            if (State == 'Init') {
                ShowNotification('Normal', "  ^- The Enable Crypto´s ISO Code has been loaded succesfully: " + CryptoEnableISOCode.toString())
                ShowNotification('Normal', "  ^- The Enable Crypto´s ID has been loaded succesfully: " + CryptoEnableID.toString())
                ShowNotification('Normal', "  ^- The Enable Currency´s ISO Code has been loaded succesfully: " + CurrencyEnableISOCode.toString())
            }

        }

    }, (errorObject) => {

        ShowNotification('ERROR', "  ^- Could not get firebase current assets enable ")

    });


}

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
            console.log(chalk.green(" [" + TodayHours + ":" + TodayMinutes + ":" + TodaySeconds + "] SYSTEM-UPDATE:" + Message))
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

module.exports = {
    "LoadPayAllSystem": LoadPayAllSystem,
    "showNotification": ShowNotification,
    "CryptoEnableISOCode": CryptoEnableISOCode,
    "UserSystemTest": UserSystemTest,
    "CryptoEnableName": CryptoEnableName,
    "CurrencyEnableISOCode": CurrencyEnableISOCode,
    "CurrencyEnableName": CurrencyEnableName,
    "CryptoEnableID": CryptoEnableID,
    "UserSystemTest": UserSystemTest,
    "GetAssetsEnable2": GetAssetsEnable2
}