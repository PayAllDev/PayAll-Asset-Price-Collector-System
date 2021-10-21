/*

-- PayAll System
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 20/10/2021
-- @Description: This file will create the conexion between Coingeck-API and or DB
-- @Programming Language: Javascript

*/

const chalk = require('chalk');
const admin = require("firebase-admin");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const request = require('request-promise')
const cheerio = require('cheerio')

let CryptoEnableISOCode, CryptoEnableName, CurrencyEnableISOCode, CurrencyEnableName, CryptoEnableID

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

    initClock('Init')
    SetFirebaseConexion()
    .then((state) => {
        ShowNotification('Normal', "  ^- " + state)
        GetAssetsEnable()
        .then((state) => {

            if(state == 'Enable Assets has been loaded correctly'){

                ShowNotification('Normal', "  ^- The Enable Crypto´s ISO Code has been loaded succesfully: " + CryptoEnableISOCode.toString())
                ShowNotification('Normal', "  ^- The Enable Crypto´s ID has been loaded succesfully: " + CryptoEnableID.toString())
                ShowNotification('Normal', "  ^- The Enable Currency´s ISO Code has been loaded succesfully: " + CurrencyEnableISOCode.toString())
                //InitPayAllSystem()

            }
            
        })
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

    if (TodayHours == 0 || 6 || 12 || 18 && TodayMinutes == 1 && TodaySeconds > 5){

        //Load and save the current Price of Currencies (USD, EUR)

    }

    setTimeout(initClock, 1000);

}

function SetFirebaseConexion() {

    return new Promise((resolve,reject) => {

        var serviceAccount = require("./pa_sdk_key.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://payall-p404-default-rtdb.firebaseio.com" });
        db = admin.database();
        resolve('The firebase conecction has been crated succesfully')

    })    

}

function GetAssetsEnable() {

    let GlobalDataRef = db.ref('System/GlobalData/ActiveElements')

    return new Promise((resolve,reject) => {

        GlobalDataRef.on('value', (snapshot) => {

            if (snapshot.val() != null) {
    
                ActiveElementsResponse = snapshot.val()
    
                CryptoEnableISOCode = ActiveElementsResponse.CryptosEnableISOCode.split(',')
                CryptoEnableName = ActiveElementsResponse.CryptosEnableName.split(',')
    
                CurrencyEnableISOCode = ActiveElementsResponse.CurrencysEnableISOCode.split(',')
                CurrencyEnableName = ActiveElementsResponse.CurrencysEnableName.split(',')
    
                CryptoEnableID = ActiveElementsResponse.CryptoEnableID.split(',')

                resolve('Enable Assets has been loaded correctly')
    
            }else{reject('Snapshot is Null')}
    
        }, (errorObject) => {
    
            reject('Could not get firebase current assets enable')
    
        });

    })

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

LoadPayAllSystem()