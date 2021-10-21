/*

-- PayAll System
-- @Author: Armando Peralta
-- @Version: 2.2.0
-- @Date: 01/10/2021
-- @Last Modification Date: 20/10/2021
-- @Description: This file will create the conexion between Coingeck-API and or DB
-- @Programming Language: Javascript

*/

const SF = require("./SharedFunctions")
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const request = require('request-promise')
const cheerio = require('cheerio')

console.log("Se ha llamado a GetAssetsEnable")

SF.loadPayAllSystem()