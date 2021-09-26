var request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
var cheerio = require('cheerio');
var common = require('../common');

chai.should();
chai.use(chaiHttp);

const ERROR_REQUEST_FAILED = "Request error";

//headers: array of {key: value}
async function crawlItem(itemUrl, headers) {
  return new Promise(async (resolve, reject) => {
    try {
      var options = {
        url: itemUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36',
        },
        jar: true
      };
      if (headers && headers.length > 0) {
        for (let i = 0; i < headers.length; i++) {
          const element = headers[i];
          options.headers[element.key] = element.value;
        }
      };

      request(options, function (err, response, html) {
        if (err) {
          common.addLog(`crawlPage ${ERROR_REQUEST_FAILED} ${itemUrl}`);
          common.addLog('Request Error in request ' + err);
          resolve(undefined);
          return;
        }

        if (html != undefined) {
          resolve(html);
        } else {
          resolve(undefined);
        }
      });
    } catch (e) {
      common.addLog(`crawlPage ${ERROR_REQUEST_FAILED} ${itemUrl}`);
      common.addLog('Catch error in request ' + e);
      resolve(undefined);
    }
  });
}

//"https://m.nhabansg.vn/nha-dat-ban.htm"
//listProperties: {
//   class,
//   element,
//   childClass,
//   childElement,
// }
//itemProperties: {
//   class,
//   element,
//   elementProp,
// }
async function crawlPage(pageUrl, headers, listProperties, itemProperties) {
  return new Promise(async (resolve, reject) => {
    try {
      var options = {
        url: pageUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36',
        },
        jar: true
      };
      if (headers && headers.length > 0) {
        for (let i = 0; i < headers.length; i++) {
          const element = headers[i];
          options.headers[element.key] = element.value;
        }
      };

      request(options, function (err, response, html) {
        if (err) {
          common.addLog(`crawlPage ${ERROR_REQUEST_FAILED} ${pageUrl}`);
          common.addLog('Request Error in request ' + err);
          resolve(undefined);
          return;
        }

        if (listProperties && itemProperties) {
          var page = cheerio.load(html);
          var itemList = page(listProperties.class);
          if (listProperties.childElement || listProperties.childClass) {
            let childElement = page(listProperties.class).html();
            var itemList = cheerio.load(childElement)(listProperties.childElement ? listProperties.childElement : listProperties.childClass);
          }
          
          let urlList = [];
          for (let i = 0; i < itemList.length; i++) {
            const itemUrl = cheerio.load(page(itemList[i]).html())(itemProperties.element).first().prop(itemProperties.elementProp);
            urlList.push(itemUrl);
          }
          resolve({ urlList, html });
        } else {
          resolve({ urlList, html });
        }
      });
    } catch (e) {
      common.addLog(`crawlPage ${ERROR_REQUEST_FAILED} ${pageUrl}`);
      common.addLog('Catch error in request ' + e);
      resolve(undefined);
    }
  });
}

module.exports = {
  crawlItem,
  crawlPage,
};