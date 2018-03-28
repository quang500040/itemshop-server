var request = require('request');
var zlib = require("zlib");
const cheerio = require('cheerio')
var fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

async function getCookie() {
    return await readFile('cookie.txt');
}

function setCookie(cookie) {
    fs.writeFile('cookie.txt', cookie, function (err, cookie) {
    });
}

async function callRequest(url, bodyString) {

    var cookie = await getCookie();

    return new Promise((resolver, reject) => {

        var options = {
            url: url,
            headers: {
                'Cookie': cookie.toString()
            }
        };

        if (bodyString)
            options.body = bodyString;

        console.log(options);

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolver(body)
            }
        }
        request(options, callback);
    });
}


async function getListItemsOnSelling() {

    var url = 'https://www.dota518.com/user/mylist.do?online=1';

    var items = await callRequest(url);
    console.log(items);

}

async function getItems() {

    var url = 'https://www.dota518.com/user/bag/sell/ajaxlist.do';

    var response = await callRequest(url);
    var items = parseItems(response);
    console.log(items);
    sellItems(items);
}

function parseItems(html) {
    const $ = cheerio.load(html);

    const items = $("#bagList div[canmove='0']");
    let itemsArr = [];

    for (i = 0; i < items.length; i++) {
        const $ = cheerio.load(items.eq(i).html());

        let item = { id: items.eq(i).attr('id'), price: $('.bccoin').text().split('\n')[0] }
        itemsArr.push(item);
    }

    return (itemsArr)
}

async function sellItems(items) {
    let itemsBody = [];

    for (i = 0; i < items.length; i++) {
        let item = { name: 'id', value: items[i].id };
        itemsBody.push(item);
        itemsBody.push({ name: 'defindex', value: '' }, { name: 'quality', value: '' }, { name: 'backpackPosition', value: '' })
    }
    console.log(itemsBody);
    let bodyString = 'left=' + encodeURIComponent(JSON.stringify(itemsBody)) + "&price=0&secrecy=1";
    var url = 'https://www.dota518.com/shoptrade/add.do';

    var response = await callRequest(url, bodyString);

    console.log(response);
}



getItems();



// getListItemsOnSelling();

// getItems("cookie", function (items) {

//     //TODO: process items
//     // sellItems(items);
//     // console.log(items);

// });