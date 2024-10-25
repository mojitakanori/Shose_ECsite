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

    console.log(selectedGenres)
    console.log("ここ！！！！！！！！selectedGenres  チェックボックスで選択されているジャンルを取得")

    // 検索クエリの作成と検索結果の反映
    search(brand = text, genres = selectedGenres)
}

let DATA = null;

// 並び替えボタンのハンドラ
const onChangeSortHandler = () => {
    // DATAをitemsに格納
    const items = DATA
    // 並び替えるインデックスを取得
    const orderIndx = document.getElementById('order').selectedIndex

    // *************************
    // 並び替えに関する条件を追加
    if (orderIndx == 0) {
        // 取得順
    } else if (orderIndx == 1) {
        // 人気順
        console.log("人気順にする！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！")
        items.sort(function (a, b){
            return b.num_of_favorite - a.num_of_favorite
        });
    } else if (orderIndx == 2) {
        // ○○順
    } else if (orderIndx == 3) {
        // ××順
    }
    // アイテム表示欄を取得し空にする,各アイテムを格納
    const parent = document.getElementById('table-wrapper')
        parent.innerHTML = ''
        items.forEach(item => {
                parent.appendChild(createItem(item))
            })
    // *************************
}

// 検索クエリの作成と検索結果の反映
const search = (brand = '', genres = []) => {
    // 引数の型チェック
    if (typeof (brand) != 'string' || typeof (genres) != 'object') {
        return "invalid argument"
    }

    isLoading(true)
    let queryStr = ''
    let EAN = {}  // ExpressionAttributeNames
    let EAV = {}  // ExpressionAttributeValues

    // ブランドに関する条件を追加
    if (brand != '') {
        queryStr += '(#bra=:bra)'
        EAN['#bra'] = 'brand'
        EAV[':bra'] = brand
    }
    // *************************
    // ジャンルに関する条件を追加 *
    // *************************
    if (genres.length != 0) {
        if (brand != '') {
            queryStr += 'AND'
        }
        if (genres.length != 1) {
            queryStr += '('
        }
        EAN['#gen'] = 'genre'
        for (let i = 0; i < genres.length; i++) {
            if (i != 0) {
                queryStr += 'OR'
            }
            queryStr += '(#gen=' + ':gen' + String(i) + ')'
            EAV[':gen' + String(i)] = genres[i]
        }
        if (genres.length != 1) {
            queryStr += ')'
        }
    }
// ((#gen=:gen0)*****(#gen=:gen1)*****(#gen=:gen2)*****(#gen=:gen3))
// "(#gen=:gen0)"

    // 最終的なparamsを作る
    let params
    if (queryStr != '') {
        params = {
            TableName: tableName,
            FilterExpression: queryStr,
            ExpressionAttributeNames: EAN,
            ExpressionAttributeValues: EAV
        }
    } else {
        // 検索条件が何もないとき
        params = { TableName: tableName }
    }
    console.log(params)
    console.log("ここ！！！！！！！！params")

    // 検索クエリを投げる
    docClient.scan(params, (err, data) => {
        if (err) {
            // エラーのときの処理
            console.log(err)
            let errStr = '<span style="color:red;">' + 'ERROR<br>' + err + '</span>'
            document.getElementById('table-wrapper').innerHTML = errStr
        } else {
            // 成功したときの処理
            console.log(data)
            console.log("ここ！！！！！！！！data返ってきたやつそのまま")
            console.log(data.Items)
            console.log("ここ！！！！！！！！data.Items")

            DATA = data.Items
            const parent = document.getElementById('table-wrapper')
            data.Items.forEach(item => {
                parent.appendChild(createItem(item))
            })
        }
        // 検索結果の件数表示
        const item_num = document.getElementById('item-num')
        item_num.innerHTML = data.Count + '件Hit!!!'
        isLoading(false)
        onChangeSortHandler()
    })
}
