const fs = require('fs');
const fetch = require('node-fetch');

const urls = {
    'stazioni': 'https://pastebin.com/raw/Y1E80QzG',
    'stazioni-adiacenti': 'https://pastebin.com/raw/Z9nQQ9Me'
}

function hasRepetitions(list, element) {
    list.forEach((elem, i) => {
        if (elem.nome === element.nome) {
            return true;
        }
    });

    return false;
}

const stazione = {
    nome: '',
    latitudine: '',
    longitudine: '',
    isAttiva: 1
};

let stazioni = [];

fs.writeFileSync('dummies.sql', '');

(async function generateData(url, fn) {
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
            nome: s.stazLabel.replace(/[']{1}/, '\'\''),
            latitudine: Number(coord.lat.substring(0, 8)),
            longitudine: Number(coord.lat.substring(0, 8))

        });

        if (!hasRepetitions(list, staz)) {
            list.add(staz);
        }
    });

    return list;
}).then((list) => {
    //console.log("called");
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
});
