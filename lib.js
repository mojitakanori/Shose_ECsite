AWS.config.update({
  region: config.AWS_REGION,
  endpoint: config.AWS_ENDPOINT,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
});
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = config.TABLE_NAME;

// アイテム表示用のdivを作成
const createItem = (item = null) => {
  const e = document.createElement("div");
  e.className = "item-box";
  if (item) {
    const imgbox = document.createElement("div");
    imgbox.className = "item-thumb";
    const img = document.createElement("img");
    img.src =
      "https://jikken3-cds.s3-ap-northeast-1.amazonaws.com/img/" +
      item.product_id +
      ".jpg";
    imgbox.appendChild(img);
    const mask = document.createElement("div");
    mask.className = "item-mask";
    const desc = document.createElement("div");
    desc.className = "item-desc";
    desc.innerHTML = item.product_info;
    mask.appendChild(desc);
    imgbox.appendChild(mask);
    e.appendChild(imgbox);

    const id = document.createElement("a");
    id.className = "item-id text-small";
    id.innerHTML = item.product_id;
    e.appendChild(id);

    const fav = document.createElement("a");
    fav.className = "item-fav text-small";
    fav.innerHTML = "♡" + item.num_of_favorite;
    e.appendChild(fav);

    const brand = document.createElement("a");
    brand.className = "item-brand text-small";
    brand.innerHTML = item.brand;
    e.appendChild(brand);

    const title = document.createElement("a");
    title.className = "item-title";
    title.innerHTML = item.product_name;
    e.appendChild(title);

    const price = document.createElement("a");
    price.className = "item-price";
    price.innerHTML = "¥" + Number(item.price).toLocaleString();
    e.appendChild(price);

    const target = document.createElement("a");
    target.className = "item-target text-small";
    target.innerHTML = item.target;
    e.appendChild(target);

    const genre = document.createElement("a");
    genre.className = "item-genre text-small";
    genre.innerHTML = ">> " + item.genre;
    e.appendChild(genre);

    const stocks = document.createElement("div");
    stocks.className = "item-stocks";
    let orderedSize = []; // 元のオブジェクトでは順序が保証されていないため小さい順に並び替える
    for (let size in item.stocks) {
      orderedSize.push(Number(size));
    }
    orderedSize.sort();
    for (let size of orderedSize) {
      const s = document.createElement("a");
      s.innerHTML = size.toFixed(1); // 小数点0埋め
      if (item.stocks[size.toFixed(1)] == true) {
        s.className = "item-stock-available";
      } else {
        s.className = "item-stock-soldout";
      }
      stocks.appendChild(s);
    }
    e.appendChild(stocks);
  }
  return e;
};

// チェックボックスで選択されているジャンルを返す（return: Array（e.g. ['シューズ', 'パンプス']））
const getSelectedGenres = () => {
  let ret = [];
  let parent = document.getElementById("genre-select-box");
  let children_count = parent.children.length;
  for (let i = 1; i <= children_count / 2; i++) {
    let targetId = "toggle" + String(i);
    console.log(targetId);
    if (document.getElementById(targetId).checked) {
      let gen = parent.getElementsByTagName("label")[i - 1];
      ret.push(gen.innerHTML);
    }
  }
  return ret;
};

// ロードアイコンの表示と非表示の切り替え（state: boolean）
const isLoading = (state) => {
  const loading = document.getElementById("loading-icon");
  if (state == true) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
};

// 画像処理
const base64Decoder = (bin) => {
  let img = new Image();
  img.src = bin;
  return img;
};
