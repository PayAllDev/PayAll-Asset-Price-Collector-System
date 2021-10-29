/*

-- PayAll System
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 29/10/2021
-- @Description: This file will create the conexion between Coingeck-API and or DB
-- @Programming Language: Javascript

*/

const SF = require('./SharedFunctions')
const admin = require("firebase-admin");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const request = require('request-promise')
const cheerio = require('cheerio');

let CryptoEnableISOCode, CryptoEnableName, CurrencyEnableISOCode, CurrencyEnableName, CryptoEnableID

let ServerResponseData

function LoadPayAllSystem() {

    //This function will print the presentation info

    SF.ShowNotification('Enter', 'Enter')
    SF.ShowNotification('Enter', 'Enter')
    SF.ShowNotification('SystemStyle', "██████╗  █████╗ ██╗   ██╗ █████╗ ██╗     ██╗     ")
    SF.ShowNotification('SystemStyle', "██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║     ██║     ")
    SF.ShowNotification('SystemStyle', "██████╔╝███████║ ╚████╔╝ ███████║██║     ██║     ")
    SF.ShowNotification('SystemStyle', "██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██║██║     ██║     ")
    SF.ShowNotification('SystemStyle', "██║     ██║  ██║   ██║   ██║  ██║███████╗███████╗")
    SF.ShowNotification('SystemStyle', "╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝")
    SF.ShowNotification('Enter', 'Enter')
    SF.ShowNotification('SystemStyle', "PayAll Asset Price Collector System (Crypto and Currencies) - Version: 2.2.0 ( 30 Oct 2021 )")
    SF.ShowNotification('Enter', 'Enter')
    SF.ShowNotification('SystemTitleStyle', " ****************** Initializing Global Functions")

    initClock('Init')
    SetFirebaseConexion()
        .then((state) => {
            SF.ShowNotification('Normal', "  ^- " + state)
            GetAssetsEnable()
                .then((state) => {

                    if (state == 'Enable Assets has been loaded correctly') {

                        SF.ShowNotification('Normal', "  ^- The Enable Crypto´s ISO Code has been loaded succesfully: " + CryptoEnableISOCode.toString())
                        SF.ShowNotification('Normal', "  ^- The Enable Crypto´s ID has been loaded succesfully: " + CryptoEnableID.toString())
                        SF.ShowNotification('Normal', "  ^- The Enable Currency´s ISO Code has been loaded succesfully: " + CurrencyEnableISOCode.toString())

                        SF.ShowNotification('SystemTitleStyle', " ****************** Initializing PayAll System")

                        CheckConnectionCoinGeckoClient()
                            .then((ServerConnectionState) => {

                                if (ServerConnectionState == 'The connection to CoinGeckoClient is created') {
                                    SF.ShowNotification('Normal', "  ^- " + ServerConnectionState)
                                    GetCryptoData()

                                }

                                if (ServerConnectionState == 'CoinGeckoClients has not responded') {
                                    SF.ShowNotification('Normal', "  ^- " + ServerConnectionState)
                                    TryCoingeckoClientConnectionAgain()

                                }

                            })

                    }

                })
        })

}

function initClock(State) {

    //This function will get the current Time and date and it will be updated each second

    let ClockDate = new Date()

    TodayYear = ClockDate.getFullYear()
    TodayMonth = ClockDate.getMonth() + 1
    TodayDay = ClockDate.getDate()
    TodayHours = ClockDate.getHours()
    TodayMinutes = ClockDate.getMinutes()
    TodaySeconds = ClockDate.getSeconds()

    TodayMonth = SF.SetCompleteNumber(TodayMonth)
    TodayDay = SF.SetCompleteNumber(TodayDay)

    if (State == 'Init') {
        SF.ShowNotification('Normal', "  ^- The clock has been initialized successfully at: " + TodayHours + ':' + TodayMinutes + ':' + TodaySeconds)
    }

    if (TodayHours == 0 || TodayHours == 6 || TodayHours == 12 || TodayHours == 18) {

        //When the current time be = 0,6,12,18 (24H System) will get the current Price of currencies as USD and EUR

        if (TodayMinutes == 0 && TodaySeconds == 1) {

            let CurrencysURLS = ["https://www.google.com/finance/quote/USD-MXN", "https://www.google.com/finance/quote/EUR-MXN"]

            for (let c = 0; c < CurrencysURLS.length; c++) {

                const CurrentURL = CurrencysURLS[c]
                const CurrentElement = CurrentURL.substring(37, 40)

                request(CurrentURL, (error, response, html) => {

                    if (!error && response.statusCode == 200) {

                        const $ = cheerio.load(html)

                        let data = html.split('YMlKec fxKbKc')

                        let ActualCurrency = data[1].substring(2, 9)

                        SF.UpdateDBData(CurrentElement, ActualCurrency, 'Currency', 'Price').then((response) => {

                            if (response == 'Success') {

                                SF.ShowNotification('NormalUpdateCoinGeck', ' The ' + CurrentElement + ' Price has been updated sucessfully')

                            } else if (response == 'Error') {

                                SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElement + ' Price has not been updated sucessfully')

                            }

                        })


                    }

                })

            }

        }

    }

    setTimeout(initClock, 1000);

}

function SetFirebaseConexion() {

    //This function will create the conexion to firebase DB

    return new Promise((resolve, reject) => {

        var serviceAccount = require("./pa_sdk_key.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://payall-p404-default-rtdb.firebaseio.com" });
        //admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://payall-p404-dev-default-rtdb.firebaseio.com" });
        db = admin.database();
        resolve('The firebase conecction has been crated succesfully')

    })

}

function GetAssetsEnable() {

    //This function get the current enable currencies and Crypto - Crypto-ID´s

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

function CreateNewData() {

    SF.HistorialDayState = {}
    SF.HigherPricesOBJ = {}
    SF.LowerPricesOBJ = {}

    for (let i = 0; i < CryptoEnableID.length; i++) {

        const CurrentElementID = CryptoEnableID[i]
        const CurrentElementPosition = CryptoEnableID.indexOf(CurrentElementID)
        const CurrentElementName = CryptoEnableName[CurrentElementPosition]
        const CurrentElementISOCode = CryptoEnableISOCode[CurrentElementPosition]

        const CurrentElementDataResponse = ServerResponseData[[CurrentElementID]]
        const CurrentElementPrice = CurrentElementDataResponse['mxn']

        SF.SaveNewHistorialData(CurrentElementISOCode, CurrentElementPrice, 'Crypto').then((response) => {

            if (response == 'Success') {

                SF.ShowNotification('Enter', '')
                SF.ShowNotification('DBSaveUpdate', ' The new ' + CurrentElementISOCode + ' Historial has been updated sucessfully')

            }

        }).catch((error) => {
            SF.ShowNotification('Enter', '')
            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' : ' + error)
        })


        SF.SetNewHLPrices(CurrentElementISOCode, CurrentElementPrice, 'Crypto').then((response) => {

            if (response == 'Success') {

                SF.ShowNotification('DBSaveUpdate', ' The new ' + CurrentElementISOCode + ' HL has been updated sucessfully')
                SF.ShowNotification('Enter', '')

            }

        }).catch((error) => {
            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' : ' + error)
            SF.ShowNotification('Enter', '')
        })

    }

    setTimeout(GetCryptoData, 6000)

}

var CheckConnectionCoinGeckoClient = async () => {

    //This function check the ping in the CoinGeckoClient

    let ServerResponse = await CoinGeckoClient.ping();

    return new Promise((resolve, reject) => {

        if (ServerResponse.message == 'OK') { resolve('The connection to CoinGeckoClient is created') }

        else { reject('CoinGeckoClients has not responded') }

    })

}

var GetCryptoData = async () => {

    //This function get data from the CoinGecko Client and process for be saved later

    try {

        let ServerResponse = await CoinGeckoClient.simple.price({ ids: CryptoEnableID, vs_currencies: ['mxn'], include_24hr_vol: ['true'], include_market_cap: ['true'], include_24hr_change: [true] });

        if (ServerResponse != '' || null) {

            SF.ShowNotification('Enter', 'Space between Last and CUrrent CoinGeckoClient Response')
            SF.ShowNotification('NormalUpdateCoinGeck', 'CoinGecko Client Response has responded correctly')

            ServerResponseData = ServerResponse.data

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

                try {

                    let ResultsPricesAnalyzed = await SF.AnalyzePrices(CurrentElementISOCode, CurrentElementPrice)

                    HigherPricesAA = ResultsPricesAnalyzed.split(',')[0]
                    LowerPricesAA = ResultsPricesAnalyzed.split(',')[1]

                    //We save the result after analize in Local OBJ

                    Object.defineProperty(SF.HigherPricesOBJ, CurrentElementISOCode, { value: HigherPricesAA, writable: true, enumerable: true })
                    Object.defineProperty(SF.LowerPricesOBJ, CurrentElementISOCode, { value: LowerPricesAA, writable: true, enumerable: true })

                    //Now we save the Current Price then

                    SF.UpdateDBData(CurrentElementISOCode, CurrentElementPrice, 'Crypto', 'Price').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' Price has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' Price has not been updated sucessfully')

                        }

                    })

                    //The Higher Price then

                    SF.UpdateDBData(CurrentElementISOCode, HigherPricesAA, 'Crypto', 'HigherPrice').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' HigherPrice has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' HigherPrice has not been updated sucessfully')

                        }

                    })

                    //The Lower Price then

                    SF.UpdateDBData(CurrentElementISOCode, LowerPricesAA, 'Crypto', 'LowerPrice').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' LowerPrice has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' LowerPrice has not been updated sucessfully')

                        }

                    })

                    //The 24 Change Price then

                    SF.UpdateDBData(CurrentElementISOCode, CurrentElement24Change, 'Crypto', 'Change').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' Change has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' Change has not been updated sucessfully')

                        }

                    })

                    //The MarketCap Price then

                    SF.UpdateDBData(CurrentElementISOCode, CurrentElementMarketCap, 'Crypto', 'MarketCap').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' MarketCap has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' MarketCap has not been updated sucessfully')

                        }

                    })

                    //The 24 Volumen then

                    SF.UpdateDBData(CurrentElementISOCode, CurrentElement24Vol, 'Crypto', 'Volumen').then((response) => {

                        if (response == 'Success') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' Volumen has been updated sucessfully')

                        } else if (response == 'Error') {

                            SF.ShowNotification('ERROR', ' ERROR with ' + CurrentElementISOCode + ' Volumen has not been updated sucessfully')

                        }

                    })

                    //The Historial Data

                    SF.UpdateDBHistorial('Crypto', CurrentElementISOCode, CurrentElementPrice, HigherPricesAA, LowerPricesAA).then((response) => {

                        if (response == 'SuccessUpd') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' Historial has been updated sucessfully')

                        } else if (response == 'SuccessCre') {

                            SF.ShowNotification('DBSaveUpdate', ' The ' + CurrentElementISOCode + ' Historial has been created sucessfully')

                        }

                    })

                    SF.ShowNotification('Enter', 'Space between CryptoCurrencies')


                } catch (Error) {

                    SF.ShowNotification('ERROR', 'CoinGeckoClient ERROR: ' + Error)

                }

            }


            // If the system detect that the current time is lower that 0:00:05 then save the data as new else keep workin each 3 seconds

            if (TodayHours == 0 && TodayMinutes == 0 && TodaySeconds <= 5) {

                CreateNewData()

            } else {

                setTimeout(GetCryptoData, 3000)

            }


        } else {

            SF.ShowNotification('Error', 'CoinGeckoClient Response is NULL')

        }

    } catch (error) {

        SF.ShowNotification('Error', 'CoinGeckoClient ERROR: ' + error)

    }

}

LoadPayAllSystem()