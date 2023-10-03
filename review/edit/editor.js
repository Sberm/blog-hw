function preview() {
    let contentBackground = document.getElementsByClassName("preview-background")[0];
    contentBackground.removeChild(contentBackground.lastChild);
    let contentContainer = document.createElement('div');
    contentContainer.setAttribute("class", "content-container");

    let title = document.getElementById("title").value;
    let rating = document.getElementById("rating").value;
    let reviewText = document.getElementById("review-text").value;
    let restaurantName = document.getElementById("restaurant-name").value;

	// 保留review text缩进换行
	const reviewTextProcessed = reviewText.replaceAll("\t", "&emsp;").replaceAll("    ", "&emsp;").replaceAll("\n", "<br>");

    let text = `
        <div class = "restaurant-name">
            <span>${restaurantName}</span>
        </div>
        <div class = "rating-score">
            <div class = "rating-text">Rating: </div>
        </div>
        <div class = "review-header">
            <p>${title}</p>
        </div>
        <div class = "review-text">
            <p>${reviewTextProcessed}</p>
        </div>
        <div class="image-background">
        </div>
    `
    contentContainer.innerHTML = text;

    // image
    let imageBackground = contentContainer.getElementsByClassName("image-background")[0];
    for (let j = 0;j < images.return_images.length; j++) {
        let img = images.return_images[j];
        let imageContainer = document.createElement("div");
        imageContainer.setAttribute("class", "image-container");
        imageContainer.innerHTML = `
            <a href="javascript:void(0);"><img class="review-img" role = "button" alt = "${img}" src = "${img}" onclick = "popUp(this)" metaId = "${id}"/>  </a>
        `
        imageBackground.appendChild(imageContainer);
    }

    // rating
    let ratingRounded = Math.floor(rating / 2);
    let half_ = false;
    if (rating / 2 - ratingRounded >= 0.5) {
        half_ = true;
    }
    let ratingScore = contentContainer.getElementsByClassName("rating-score")[0];
    for (let j = 0;j < ratingRounded; j++) {
        let div_ = document.createElement("div");
        div_.setAttribute("id", "rating-circle");
        ratingScore.appendChild(div_);
    }
    if (half_) {
        let div_ = document.createElement("div");
        div_.setAttribute("id", "rating-circle-half");
        ratingScore.appendChild(div_);
    }
    let ratingDigits = document.createElement("div");
    ratingDigits.setAttribute("class", "rating-digits");
    ratingDigits.innerHTML = `
        <span>${rating}</span>
    `;
    ratingScore.appendChild(ratingDigits);

    contentBackground.appendChild(contentContainer);
}

async function deleteAllImages() {
    if (!confirm("确定删除所有图片？删除后无法恢复")) {
        return;
    }
    const data = {
        id: id
    };
    const url = "https://sberm.cn/review/delete-image";
    const responseR = await fetch(url, {
        method: "POST", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json", 
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
        body: JSON.stringify(data)
    });
    const response = await responseR.json();
    //console.log(response);
    if(response.code == 200){
        images.return_images = [];
        clearSelectPreviewImage();
        preview();
    }
}

async function deleteReview() {
    if (!confirm("确定删除该评价？删除后无法恢复")) {
        return;
    }
    const data = {
        id: id
    };
    const url = "https://sberm.cn/review/delete";
    const responseR = await fetch(url, {
        method: "POST", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json", 
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
        body: JSON.stringify(data)
    });
    const response = await responseR.json();
    // console.log(response);
    if(response.code == 200){
        window.location.replace("https://sberm.cn/review/edit");
    }
}

async function createOrModify() {

    let title = document.getElementById("title").value;
    let rating = document.getElementById("rating").value;
    let reviewText = document.getElementById("review-text").value;
    let restaurantName = document.getElementById("restaurant-name").value;
    let url = "https://sberm.cn/review/";
    if (restaurantName == "") {
        alert("餐厅名称不能为空");
        return;
    }
    const data = {
        id: id,
        title: title,
        rating: rating == "" ? 0.0 : parseFloat(rating),
        review_text: reviewText,
        restaurant_name: restaurantName,
    };

    routing = {
        createModR: "create-modify", 
        saveImageR: "save-image",
        dbInsertImage: "db-insert-img"
    }

    const fetchCreateMod = fetch(
        url + routing.createModR,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    ).then((res) => res.json());

    const response = await fetchCreateMod;
    let refresh = false;

    if (id == -1) {
        id = response.id;
        //console.log("new id:", id);
        refresh = true;
    }

    const fetchSaveImage = [];
    files.forEach(element => {
        if (element) {
            let data = new FormData();
            data.append('file', element, element.name);
            fetchSaveImage.push(fetch(
                url + routing.saveImageR,
                {
                    method: "POST",
                    body: data
                }
            ).then((res) => res.json()));
        }
    });

    const fileNames = []
    files.forEach(element => {
        if (element) {
            fileNames.push(element.name);
        }
    });
    let insertImageData = {
        id: id,
        fileNames: fileNames
    }
    const fetchDBInsertImage = fetch(
        url + routing.dbInsertImage,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(insertImageData)
        }
    ).then((res) => res.json());

    // upload images
    const requests = [fetchDBInsertImage].concat(fetchSaveImage);
    const responseImage = await Promise.all(requests);
    //console.log(responseImage);

    // 更新照片用于preview
    images = await fetchImages();

    if (refresh && response.code == 200) {
        clearSelectPreviewImage();
        window.location.replace(`https://sberm.cn/review/editor?id=${response.id}`);
    } else if (response.code == 200) {
        clearSelectPreviewImage();
        alert("保存成功");
        preview();
    } else {
        alert("保存失败");
    }
}

function clearSelectPreviewImage() {
    files = [];
    fileSet = new Set();
    let previewBackground = document.getElementsByClassName("preview-image-background")[0];
    previewBackground.innerHTML = "";
    let fileTag = document.getElementById("filetag");
}


async function fetchImages() {
    let url = "https://sberm.cn/review/fetch-images";
    data = {
        id: id
    };
    const response = await fetch(url, {
        method: "POST", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
        body: JSON.stringify(data), 
    });
    return await response.json();
}

async function fetchContent() {
    let base_url = "https://sberm.cn/review/fetch-review-content";
    const data = {
        empty: "empty"
    };

    if (id == -1) {
        return null;
    }
    let url = base_url + `?id=${id}`;

    const response = await fetch(url, {
        method: "GET", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
    });
    return await response.json(); 
}


function previewFiles() {
    let newFiles = document.getElementById("filetag").files;
    let previewBackground = document.getElementsByClassName("preview-image-background")[0];
    function readAndPreview(file, fileIndex) {

        //console.log("file set", fileSet);
        //console.log("files are", files);

        // console.log("file name is", file.name);
        if (fileSet.has(file.name)) {
            return;
        }
        fileSet.add(file.name);
        files.push(file);
        let reader = new FileReader();
        reader.addEventListener(
            "load",
            function() {
                let image = new Image();
                let container = document.createElement("div");
                let deleteButton = document.createElement("div");
                let deleteButtonImage = new Image();
                deleteButton.setAttribute("class", "preview-delete-button");
                deleteButtonImage.src = "/images/delete-button.png";
                container.setAttribute("class", "preview-image-container");
                image.setAttribute("class", "preview-img");
                image.src = this.result;
                deleteButton.appendChild(deleteButtonImage);
                deleteButton.setAttribute("file-index", fileIndex.toString());
                deleteButton.addEventListener(
                    "click", 
                    function() {
                        let fileIndex_ = parseInt(this.getAttribute("file-index"));
                        this.parentNode.remove();
                        files[fileIndex_] = null;
                        // console.log(files);
                });
                container.appendChild(deleteButton);
                container.appendChild(image);
                previewBackground.appendChild(container);
            },
            false
        );
        reader.readAsDataURL(file);
    }


    if (newFiles) {
        for (let index = 0;index < newFiles.length; index++) {
            readAndPreview(newFiles[index], index);
        }
    }
}


async function main() {
    id = parseInt((new URL(document.location)).searchParams.get("id"));
    let content = await fetchContent();
    images = await fetchImages();
    // images.return_images.forEach(fileSet.add, fileSet);
    images.return_images.forEach(item => {
        const imageSplit = item.split('/');
        fileSet.add(imageSplit.pop());
    })
    if (content != null) {
        let title = document.getElementById("title");
        let rating = document.getElementById("rating");
        let reviewText = document.getElementById("review-text");
        let restaurantName = document.getElementById("restaurant-name");
        title.value = content.return_review.title;
        rating.value = content.return_review.rating;
        reviewText.value = content.return_review.review_text;
        restaurantName.value = content.return_review.restaurant_name;
        preview();
    }
}

let id;
let images;
let files = [];
let fileSet = new Set();
main();
