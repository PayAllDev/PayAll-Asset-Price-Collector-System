/*

-- PayAll System
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 20/10/2021
-- @Description: This file will create the conexion between Coingeck-API and or DB
-- @Programming Language: Javascript

*/

const SF = require('./SharedFunctions')
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

                    if (state == 'Enable Assets has been loaded correctly') {

                        ShowNotification('Normal', "  ^- The Enable Crypto´s ISO Code has been loaded succesfully: " + CryptoEnableISOCode.toString())
                        ShowNotification('Normal', "  ^- The Enable Crypto´s ID has been loaded succesfully: " + CryptoEnableID.toString())
                        ShowNotification('Normal', "  ^- The Enable Currency´s ISO Code has been loaded succesfully: " + CurrencyEnableISOCode.toString())

                        ShowNotification('SystemTitleStyle', " ****************** Initializing PayAll System")

                        CheckConnectionCoinGeckoClient()
                            .then((ServerConnectionState) => {

                                if (ServerConnectionState == 'The connection to CoinGeckoClient is created') {
                                    ShowNotification('Normal', "  ^- " + ServerConnectionState)
                                    GetCryptoData()

                                }

                                if (ServerConnectionState == 'CoinGeckoClients has not responded') {
                                    ShowNotification('Normal', "  ^- " + ServerConnectionState)
                                    TryCoingeckoClientConnectionAgain()

                                }

                            })

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

    if (TodayHours == 0 || 6 || 12 || 18 && TodayMinutes == 1 && TodaySeconds > 5) {

        //Load and save the current Price of Currencies (USD, EUR)

    }

    setTimeout(initClock, 1000);

}

function SetFirebaseConexion() {

    return new Promise((resolve, reject) => {

        var serviceAccount = require("./pa_sdk_key.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://payall-p404-default-rtdb.firebaseio.com" });
        db = admin.database();
        resolve('The firebase conecction has been crated succesfully')

    })

}

function GetAssetsEnable() {

    let GlobalDataRef = db.ref('System/GlobalData/ActiveElements')

    return new Promise((resolve, reject) => {

        GlobalDataRef.on('value', (snapshot) => {

            if (snapshot.val() != null) {

                ActiveElementsResponse = snapshot.val()

                CryptoEnableISOCode = ActiveElementsResponse.CryptosEnableISOCode.split(',')
                CryptoEnableName = ActiveElementsResponse.CryptosEnableName.split(',')

                CurrencyEnableISOCode = ActiveElementsResponse.CurrencysEnableISOCode.split(',')
                CurrencyEnableName = ActiveElementsResponse.CurrencysEnableName.split(',')

                CryptoEnableID = ActiveElementsResponse.CryptoEnableID.split(',')

                resolve('Enable Assets has been loaded correctly')

            } else { reject('Snapshot is Null') }

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

var CheckConnectionCoinGeckoClient = async () => {

    let ServerResponse = await CoinGeckoClient.ping();

    return new Promise((resolve, reject) => {

        if (ServerResponse.message == 'OK') { resolve('The connection to CoinGeckoClient is created') }

        else { reject('CoinGeckoClients has not responded') }

    })

}

var GetCryptoData = async () => {

    try {

        let ServerResponse = await CoinGeckoClient.simple.price({ ids: CryptoEnableID, vs_currencies: ['mxn'], include_24hr_vol: ['true'], include_market_cap: ['true'], include_24hr_change: [true] });

        let ServerResponseData = ServerResponse.data

        for (let i = 0; i < CryptoEnableID.length; i++) {

            const CurrentElementID = CryptoEnableID[i]
            const CurrentElementPosition = CryptoEnableID.indexOf(CurrentElementID)
            const CurrentElementName = CryptoEnableName[CurrentElementPosition]
            const CurrentElementISOCode = CryptoEnableISOCode[CurrentElementPosition]

            const CurrentElementDataResponse = ServerResponseData[[CurrentElementID]]
            const CurrentElementPrice = CurrentElementDataResponse['mxn']
            const CurrentElementMarketCap = CurrentElementDataResponse['mxn_market_cap']
            const CurrentElement24Vol = CurrentElementDataResponse['mxn_24h_vol']
            const CurrentElement24Change = CurrentElementDataResponse['mxn_24h_change']

            PriceComparator(CurrentElementISOCode, CurrentElementPrice)
                .then((FState) => {
                    SaveCurrentHLPrice(CurrentElementISOCode, CurrentElementHigherPrice, CurrentElementLowerPrice)
                        .then((FState) => {
                            SaveCurrentPrice(CurrentElementISOCode, CurrentElementPrice)
                                .then((Fstate) => {
                                    SaveCurrentMarketCap(CurrentElementISOCode, CurrentElementMarketCap)
                                        .then((Fstate) => {
                                            SaveCurrentVol(CurrentElementISOCode, CurrentElement24Vol)
                                                .then((Fstate) => {
                                                    SaveCurrentChange(CurrentElementISOCode, CurrentElement24Change)
                                                        .then((Fstate) => {
                                                            ShowNotification('Normal', CurrencyEnableISOCode + ' Data has been updated Correctly')
                                                            ShowNotification('Enter', 'Enter')

                                                        })
                                                })
                                        })
                                })
                        })

                })

            ShowNotification('Enter', 'Enter')
            console.log('Current Element in Process: ' + CurrentElementID)
            console.log('Current Element in Process: ' + CurrentElementName)
            console.log('Current Element in Process: ' + CurrentElementISOCode)
            ShowNotification('Enter', 'Enter')
            console.log(CurrentElementPrice)
            console.log(CurrentElementMarketCap)
            console.log(CurrentElement24Vol)
            console.log(CurrentElement24Change)



        }

        /*if (ServerResponse.data != null) {

            ShowNotification('Enter', "")
            ShowNotification('Normal', "  ^- The data has been obtained successfully ")
            ShowNotification("Enter", "")

            for (let i = 0; i < ServerResponseDataKey.length; i++) {

                ElementInProcces = ServerResponseDataKey[i]

                if (ElementInProcces.includes('-')) {

                    ElementInProccesSep = ElementInProcces.split('-')
                    ElementInProccesSepClean = ""
                    LastWord = ""

                    for (let x = 0; x <= ElementInProccesSep.length - 1; x++) {

                        CurrentWord = ElementInProccesSep[x].charAt(0).toUpperCase() + ElementInProccesSep[x].slice(1)
                        ElementInProccesClean = LastWord + " " + CurrentWord
                        LastWord = CurrentWord

                    }

                    if (ElementInProcces == 'true-usd') {
                        ElementInProccesClean = 'TrueUSD'

                    }

                    ElementInProccesISDCodeIndex = CryptoEnableName.indexOf(ElementInProccesClean)
                    ElementInProccesISDCode = CryptoEnableISOCode[ElementInProccesISDCodeIndex]

                } else {

                    if (ElementInProcces == 'ripple') {
                        ElementInProccesClean = 'RippleX'
                    } else {
                        ElementInProccesClean = ElementInProcces.charAt(0).toUpperCase() + ElementInProcces.slice(1)
                    }

                    ElementInProccesISDCodeIndex = CryptoEnableName.indexOf(ElementInProccesClean)
                    ElementInProccesISDCode = CryptoEnableISOCode[ElementInProccesISDCodeIndex]


                }

                ElementDataInProcces = ServerResponseDataValues[i]
                ElementInProccesCurrentPrice = ElementDataInProcces.mxn
                ElementInProccesMarketCap = ElementDataInProcces.mxn_market_cap
                ElementInProccesVolumen24 = ElementDataInProcces.mxn_24h_vol
                ElementInProccesChange24 = ElementDataInProcces.mxn_24h_change

                savePriceRT(ElementInProccesISDCode,ElementInProccesCurrentPrice)                
                InitPriceComparator(ElementInProccesISDCode, ElementInProccesCurrentPrice)
                saveMarketCapRT(ElementInProccesISDCode,ElementInProccesMarketCap)                    
                saveVolCapRT(ElementInProccesISDCode,ElementInProccesVolumen24)
                savePriceChange(ElementInProccesISDCode,ElementInProccesChange24)

            }

        }

        setTimeout(GetAgain, 3000);*/

    } catch (error) {
        ShowNotification('Error', error)
    }

}

LoadPayAllSystem()