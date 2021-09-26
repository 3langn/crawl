var cheerio = require("cheerio");

var common = require("../common");
const OutputModel = require("../outputmodel");
const crawlerRealEstateUtils = require("./crawlerRealEstateUtils");

const ERROR_REQUEST_FAILED = "Request error";

module.exports = {
  crawlItem,
  crawlPage,
};
//const host = "mogi.vn";
const host = "raovat.vnexpress.net";
const hostName = `https://${host}`;

async function crawlItem(itemUrl) {
  let childhtml = await crawlerRealEstateUtils.crawlItem(itemUrl);
  //Create new model
  var itemData = await OutputModel.validate({});
  if (childhtml) {
    try {
      var childPage = cheerio.load(childhtml);

      itemData.nguon = host;
      itemData.pageurl = hostName + itemUrl;
      //breadcrumb-inner
      //".breadcrumb"
      itemData.loaibds = childPage(".breadcrumb-inner")
        .children()
        .last()
        .text();
      itemData.tieude = childPage("h1").text().trim();
      //.address
      var tempDiachi = childPage(".info-location").text().trim();
      if (tempDiachi.match(/^\d/)) {
        itemData.diachi = tempDiachi;
      }
      var resDiachi = tempDiachi.split(",");
      for (var i = 0; i < resDiachi.length; i++) {
        if (resDiachi[i].indexOf("Đường") > -1) {
          itemData.tenduong = resDiachi[i]
            .substring(resDiachi[i].indexOf("Đường"), resDiachi[i].length)
            .trim();
        } else if (resDiachi[i].indexOf("Huyện") > -1) {
          itemData.quanhuyen = resDiachi[i]
            .substring(resDiachi[i].indexOf("Huyện"), resDiachi[i].length)
            .trim();
        } else if (resDiachi[i].indexOf("Quận") > -1) {
          itemData.quanhuyen = resDiachi[i]
            .substring(resDiachi[i].indexOf("Quận"), resDiachi[i].length)
            .trim();
        } else if (resDiachi[i].indexOf("Quận") > -1) {
          itemData.quanhuyen = resDiachi[i]
            .substring(resDiachi[i].indexOf("Quận"), resDiachi[i].length)
            .trim();
        } else {
          if (i === 0) {
            if (tempDiachi.match(/^\d/)) {
              var tempTenDuong = resDiachi[i].trim();
              tempTenDuong = tempTenDuong.substr(
                tempTenDuong.indexOf(" "),
                tempTenDuong.length
              );
              itemData.tenduong = common.repairString(tempTenDuong);
            } else {
              itemData.tenduong = common.repairString(resDiachi[i].trim());
            }
          } else {
            itemData.tinhthanh = resDiachi[i].trim();
          }
        }
      }
      itemData.gia = common.extractPrice(
        //.price
        childPage(".price-current-value").first().text().trim()
      );
      //.info-content-body
      itemData.noidung = childPage(".content-detail").children().first().text();
      //.trim();
      itemData.ten =
        //.agent-name
        childPage(".info-item")
          .first()
          .text()
          .replace("Người đăng:", "")
          .trim();
      //.agent-contact
      let contactHtml = childPage(".info-item")
        .children()
        .last()
        .text()
        .replace("Bấm để hiện số", "");
      itemData.sodienthoai = common.repairPhone(contactHtml);

      // childPage(".info-attrs")
      //   .children("div")
      //   .each(function (index, key) {
      //     var infoText = childPage(this).text();
      //     console.log(infoText);
      //     if (infoText.indexOf("Diện tích sử dụng") > -1) {
      //       itemData.dientichsudung = common.extractMeter(
      //         infoText.replace("Diện tích sử dụng", "")
      //       );
      //       itemData.dientichsudung = common.repairString(
      //         itemData.dientichsudung
      //       );
      //     } else if (infoText.indexOf("Diện tích đất") > -1) {
      //       var tempDienTichDat = common.extractMeter(
      //         infoText.replace("Diện tích đất", "")
      //       );

      //       if (tempDienTichDat.indexOf("(") > -1) {
      //         itemData.dientichdat = tempDienTichDat.substr(
      //           0,
      //           tempDienTichDat.indexOf("(")
      //         );

      //         var tempKichThuoc = tempDienTichDat.substr(
      //           tempDienTichDat.indexOf("("),
      //           tempDienTichDat.length - tempDienTichDat.indexOf("(")
      //         );
      //         tempKichThuoc = tempKichThuoc.replace("(", "").replace(")", "");

      //         var tempKichThuocDetail = tempKichThuoc.split("x");

      //         if (tempKichThuocDetail.length > 1) {
      //           itemData.chieurong = tempKichThuocDetail[0];
      //           itemData.chieudai = tempKichThuocDetail[1];
      //         }
      //       } else {
      //         itemData.dientichdat = tempDienTichDat;
      //       }
      //       itemData.dientichdat = common.repairString(itemData.dientichdat);
      //     } else if (infoText.indexOf("Ngày đăng") > -1) {

      //     } else if (infoText.indexOf("Phòng ngủ") > -1) {
      //       itemData.sophongngu = common.repairString(
      //         infoText.replace("Phòng ngủ", "")
      //       );
      //     } else if (infoText.indexOf("Nhà tắm") > -1) {
      //       itemData.sotoilet = common.repairString(
      //         infoText.replace("Nhà tắm", "")
      //       );
      //     } else if (infoText.indexOf("Pháp lý") > -1) {
      //       itemData.phaply = common.repairString(
      //         infoText.replace("Pháp lý", "")
      //       );
      //     } else if (infoText.indexOf("Hướng") > -1) {
      //       itemData.huongnha = common.repairString(
      //         infoText.replace("Hướng", "")
      //       );
      //     } else if (infoText.indexOf("https://mogi.vn") > -1) {
      //       itemData.pageurl = common.repairString(infoText);
      //     }
      //   });
      itemData.ngaydang = childPage(".info-posting-time").text();

      childPage(".list-attributes")
        .children("li")
        .each(function (i, e) {
          infoText = childPage(this).text().trim();
          if (infoText.indexOf("Ưu đãi & hỗ trợ:") > -1) {
          } else if (infoText.indexOf("Đặc điểm nổi bật:") > -1) {
          } else if (infoText.indexOf("Về giáo dục:") > -1) {
          } else if (infoText.indexOf("Cộng đồng dân cư:") > -1) {
          } else if (infoText.indexOf("Đơn vị thi công:") > -1) {
          } else if (infoText.indexOf("Mô tả vị trí:") > -1) {
            itemData.vitridat = common.repairString(
              infoText.replace("Mô tả vị trí:", "")
            );
          } else if (infoText.indexOf("Giấy tờ pháp lý:") > -1) {
            itemData.phaply = common.repairString(
              infoText.replace("Giấy tờ pháp lý:", "")
            );
          } else if (infoText.indexOf("Diện tích căn hộ(m²):") > -1) {
            itemData.dientichdat = common.repairString(
              infoText.replace("Diện tích căn hộ(m²):", "")
            );
          } else if (infoText.indexOf("Hướng nhà:") > -1) {
            itemData.huongnha = common.repairString(
              infoText.replace("Hướng nhà:", "").trim()
            );
          } else if (infoText.indexOf("Số tầng:") > -1) {
            itemData.sotang = common.repairString(
              infoText.replace("Số tầng:", "").trim()
            );
          } else if (infoText.indexOf("Phòng tắm:") > -1) {
            itemData.sotoilet = common.repairString(
              infoText.replace("Phòng tắm:", "").trim()
            );
          } else if (infoText.indexOf("Phòng ngủ:" > -1)) {
            itemData.sophongngu = common.repairString(
              infoText.replace("Phòng ngủ:", "").trim()
            );
          }
        });
      itemData = common.validateOutput(itemData);

      return itemData;
    } catch (e) {
      common.addLog(`crawlItem ${ERROR_REQUEST_FAILED} ${itemUrl}`);
      common.addLog(e);
      return itemData;
    }
  }
}

//"https://mogi.vn/mua-nha-dat"
async function crawlPage(pageUrl) {
  let headers = [
    {
      key: "Host",
      value: host,
    },
  ];
  //Main page
  //class list-item-post, child item-post
  let listProperties = {
    class: ".list-item-post", //,".props"
    childElement: ".item-post", // ".prop-info"
    //TODO:
    // class: ".props",
    // childElement: ".prop-info"
  };
  //Lấy thẻ đến trang của từng item
  let itemProperties = {
    element: "a",
    elementProp: "href",
  };
  // Lay cac url cua page
  let result = await crawlerRealEstateUtils.crawlPage(
    pageUrl,
    headers,
    listProperties,
    itemProperties
  );

  return new Promise((resolve, reject) => {
    if (result) {
      let promiseList = [];
      for (let i = 0; i < result.urlList.length; i++) {
        const itemUrl = "https://raovat.vnexpress.net" + result.urlList[i];
        //TODO:const itemUrl =  result.urlList[i];
        //Xử lý tất cả logic !!!!
        let promise = crawlItem(itemUrl);
        promiseList.push(promise);
      }
      Promise.all(promiseList).then((values) => {
        resolve(values);
      });
    } else {
      resolve([]);
    }
  });
}

// crawlPage("https://mogi.vn/mua-nha-dat").then((data) => {
//   console.log(data);
// })

// crawlItem("https://mogi.vn/quan-6/mua-nha-mat-tien-pho/ban-nha-mt-quan-6-kdc-phu-lam-cho-lon-gia-17-ty-co-thang-may-ham-xe-id21400016").then((data) => {
//   console.log(data);
// });
