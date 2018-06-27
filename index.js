const fs = require('fs');
const fetch = require('node-fetch');

const urls = new Map();

urls.set('stazioni', 'https://pastebin.com/raw/Y1E80QzG');
urls.set('stazioni-adiacenti', 'https://pastebin.com/raw/Z9nQQ9Me');

const stazione = {
    nome: '',
    latitudine: '',
    longitudine: '',
    isAttiva: 1
};

let stazioni = [];

fs.writeFileSync('dummies.sql', '');

(async (urls = {}, fns = {}) => {
    urls.forEach(async (url, key) => {
        let data;

        try {
            data = await (await fetch(url)).json();
            console.log(data);

            if () {
                fns[key].call(data);
            }
            else {

            }
        }
        catch (err) {
            console.error(err);
        }
    });
})(urls, {
    'stazioni': (data) => {
        let list = new Set();

        data.forEach((s, index) => {
            const coordinate = {
                lat: 0,
                lon: 0
            };

            let coord = Object.assign({}, coordinate, /Point\((?<lon>-?[0-9]{1,3}(?:.[0-9]{1,9})?) (?<lat>-?[0-9]{1,3}(?:.[0-9]{1,9})?)\)/.exec(s.coordinate).groups);

            let staz = Object.assign({}, stazione, {
                nome: s.stazLabel.replace(/[']{1}/g, '\'\''),
                latitudine: Number(coord.lat.substring(0, 8)),
                longitudine: Number(coord.lon.substring(0, 8))

            });

            list.add(staz);
        });

        for (let staz of list) {
            let {nome, latitudine, longitudine} = staz;

            let keys = [];
            keys = Object.keys(stazione).filter((elem, index) => {
                if (elem === 'isAttiva') {
                    keys.slice(index);
                }
                else {
                    return elem;
                }
            }).join(', ');

            let query = `INSERT INTO stazioni(${keys}) VALUES ('${nome}', ${latitudine}, ${longitudine});\n`
            fs.writeFileSync('dummies.sql', query, {flag: 'as'});
        }
    }
});

/*(async function generateData(url, fn) {
    let res = {};

    try {
        res = await (await fetch(url)).json();
    }
    catch (err) {
        console.error(err);
    }

    return await fn(res);
})(urls.stazioni, (data) => {
    let list = new Set();

    data.forEach((s, index) => {
        const coordinate = {
            lat: 0,
            lon: 0
        };

        let coord = Object.assign({}, coordinate, /Point\((?<lon>-?[0-9]{1,3}(?:.[0-9]{1,9})?) (?<lat>-?[0-9]{1,3}(?:.[0-9]{1,9})?)\)/.exec(s.coordinate).groups);

        let staz = Object.assign({}, stazione, {
            nome: s.stazLabel.replace(/[']{1}/g, '\'\''),
            latitudine: Number(coord.lat.substring(0, 8)),
            longitudine: Number(coord.lon.substring(0, 8))

        });

        if (!hasRepetitions(list, staz)) {
            list.add(staz);
        }
    });

    return list;
}).then((list) => {

});*/
