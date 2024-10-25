// ページの読み込みが完了したときの動作
window.onload = () => {
    // dynamoDB_scan_all()
}

// 主な使用関数
// document.getElementById('') -> html内にある要素をidによって取得

// Searchボタンのハンドラ
const onClickSearchHandler = () => {
    // アイテム表示欄を取得し空にする
    const parent = document.getElementById('table-wrapper')
    parent.innerHTML = ''

    // テキストボックスの内容を取得する
    const text = document.getElementById('txtbox-brand').value

    // チェックボックスで選択されているジャンルを取得
    let selectedGenres = getSelectedGenres()

    // 下限価格と上限価格を取得
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    // 検索クエリの作成と検索結果の反映
    search(text, selectedGenres, minPrice, maxPrice)
}

let DATA = null;

// 並び替えボタンのハンドラ
const onChangeSortHandler = () => {
    // DATAをitemsに格納
    const items = DATA;
    // 並び替えるインデックスを取得
    const orderIndx = document.getElementById('order').selectedIndex;

    // 並び替えに関する条件を追加
    if (orderIndx === 1) {  // 人気順
        items.sort((a, b) => b.num_of_favorite - a.num_of_favorite);
    } else if (orderIndx === 2) {  // 安い順
        items.sort((a, b) => a.price - b.price);
    } else if (orderIndx === 3) {  // 高い順
        items.sort((a, b) => b.price - a.price);
    }

    // アイテム表示欄を取得し空にする, 各アイテムを格納
    const parent = document.getElementById('table-wrapper');
    parent.innerHTML = '';
    items.forEach(item => {
        parent.appendChild(createItem(item));
    });
}


// 検索クエリの作成と検索結果の反映
const search = (brand = '', genres = [], minPrice = 0, maxPrice = 100000) => {
    // 引数の型チェック
    if (typeof (brand) != 'string' || !Array.isArray(genres)) {
        return "invalid argument";
    }

    isLoading(true);
    let queryStr = '';
    let EAN = {};  // ExpressionAttributeNames
    let EAV = {};  // ExpressionAttributeValues

    // ブランドに関する条件を追加
    if (brand !== '') {
        queryStr += '(#bra = :bra)';
        EAN['#bra'] = 'brand';
        EAV[':bra'] = brand;
    }

    // ジャンルに関する条件を追加
    if (genres.length > 0) {
        if (queryStr !== '') {
            queryStr += ' AND ';
        }
        queryStr += '(' + genres.map((_, i) => `#gen = :gen${i}`).join(' OR ') + ')';
        EAN['#gen'] = 'genre';
        genres.forEach((genre, i) => {
            EAV[`:gen${i}`] = genre;
        });
    }

    // 価格範囲に関する条件を追加
    if (minPrice !== '0' || maxPrice !== '100000') {
        if (queryStr !== '') {
            queryStr += ' AND ';
        }
        queryStr += '(#price BETWEEN :minPrice AND :maxPrice)';
        EAN['#price'] = 'price';
        EAV[':minPrice'] = Number(minPrice);
        EAV[':maxPrice'] = Number(maxPrice);
    }

    // クエリパラメータの設定
    const params = queryStr ? {
        TableName: tableName,
        FilterExpression: queryStr,
        ExpressionAttributeNames: EAN,
        ExpressionAttributeValues: EAV
    } : { TableName: tableName };

    console.log(params);

    // 検索クエリを投げる
    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            const errStr = `<span style="color:red;">ERROR<br>${err}</span>`;
            document.getElementById('table-wrapper').innerHTML = errStr;
        } else {
            console.log("データ取得成功:", data.Items);
            DATA = data.Items;
            const parent = document.getElementById('table-wrapper');
            data.Items.forEach(item => {
                parent.appendChild(createItem(item));
            });
            document.getElementById('item-num').innerText = `${data.Count}件Hit!!!`;
        }
        isLoading(false);
        onChangeSortHandler();
    });
}
