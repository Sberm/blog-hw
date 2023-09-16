function removePopUp() {
    var popUpWindow = document.getElementsByClassName("image-popup")[0];
    popUpWindow.remove();
}

function movePointerReload(offset) {

    let ip = imagePointer;
    imagePointer = (imagePointer + offset < 0 || imagePointer + offset >= popUpImageLength) ? imagePointer : imagePointer + offset;
    if (ip == imagePointer) {
        return
    }

    // console.log("image pointer is",imagePointer)

    let popUpWindowImage = document.getElementsByClassName("popup-img")[0];
    popUpWindowImage.src = REVIEW_IMG[imageArrayPointer].images[imagePointer];
}

function popUp(imageSourceDiv) {
    let body_ = document.body;
    let popUpWindow = document.createElement("div");
    let quitButton = document.createElement("div");
    let quitButtonImage = document.createElement("img");
    let quitButtonLink = document.createElement("a");
    popUpWindow.setAttribute("class", "image-popup");
    quitButton.setAttribute("class", "popup-quit-button");
    quitButtonImage.src = "/images/delete-button.png";
    quitButton.appendChild(quitButtonImage);
    quitButtonLink.href = "javascript:void(0);";
    quitButton.addEventListener('click', removePopUp);
    quitButtonLink.appendChild(quitButton);
    let image_ = document.createElement("img");
    image_.setAttribute("class", "popup-img");
    image_.src = imageSourceDiv.src;
    popUpWindow.appendChild(image_);
    popUpWindow.appendChild(quitButtonLink);

    let metaId = parseInt(imageSourceDiv.getAttribute("metaId"));
    let imageSrc = imageSourceDiv.src;

    for (let index = 0;index < REVIEW_IMG.length; index++) {
        if (REVIEW_IMG[index].id == metaId) {
            imageArrayPointer = index;
            for (let jndex = 0;jndex < REVIEW_IMG[imageArrayPointer].images.length; jndex++) {
                imgReg = new RegExp(REVIEW_IMG[imageArrayPointer].images[jndex]);
                if (imageSrc.match(imgReg)) {
                    imagePointer = jndex;
                    break;
                }
            }
            break;
        }
    }

    popUpImageLength = REVIEW_IMG[imageArrayPointer].images.length;

    let leftArrow = document.createElement("img");
    leftArrow.src = "/images/review/arrowl.svg";
    leftArrow.setAttribute("class", "left-arrow");
    leftArrow.setAttribute("onclick", "movePointerReload(-1);");

    let rightArrow = document.createElement("img");
    rightArrow.src = "/images/review/arrowr.svg";
    rightArrow.setAttribute("class", "right-arrow");
    rightArrow.setAttribute("onclick", "movePointerReload(1);");

    // cursor -> hand
    let leftArrow_ = document.createElement("a");
    leftArrow_.setAttribute("href", "javascript:void(0);");
    leftArrow_.appendChild(leftArrow);

    let rightArrow_ = document.createElement("a");
    rightArrow_.setAttribute("href", "javascript:void(0);");
    rightArrow_.appendChild(rightArrow);

    popUpWindow.appendChild(leftArrow_);
    popUpWindow.appendChild(rightArrow_);

    body_.appendChild(popUpWindow);

}

async function fetchReviewData(kwargs) {
    let url = "";
    let data = null;
    if (kwargs.isData == true) {
        url = "https://sberm.cn/review/fetch-review";
        data = {
            empty: "empty"
        };
    } else if (kwargs.isImage == true) {
        url = "https://sberm.cn/review/fetch-images";
        data = {
            id: kwargs.id
        };
    }

    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

async function setContent(da, contentBackground) {

    const id = da.id;
    const title = da.title;
    const rating = da.rating;
    const date = da.review_date;
    const reviewText = da.review_text;
    const restaurantName = da.restaurant_name;

    let contentContainer = document.createElement('div');
    contentContainer.setAttribute("class", "content-container");

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
            <p>${reviewText}</p>
        </div>
        <div class="image-background">
        </div>
        <div class = "review-date">Review date:&nbsp;&nbsp;${date}</div>
    `
    contentContainer.innerHTML = text;

    // image
    let images = await fetchReviewData({isImage: true, id: id});
    let imageBackground = contentContainer.getElementsByClassName("image-background")[0];
    REVIEW_IMG.push({
        id: id,
        images: images.return_images
    });
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
    let ratingRounded = Math.floor(rating);
    let half_ = false;
    if (rating - ratingRounded >= 0.5) {
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
    contentBackground.innerHTML += '<hr class = "custom-hr">';
}


async function onLoad() {
    let data = await fetchReviewData({isData: true});
    var contentBackground = document.createElement('div');
    contentBackground.setAttribute("class", "content-background");
    document.body.appendChild(contentBackground);
    for (let index = 0; index < data.return_review.length; index++) {
        setContent(data.return_review[index], contentBackground);
    }
    // await setContent();
    // document.body.appendChild(contentBackground);
}

// 存储图片路径
let REVIEW_IMG = [];
let popUpImageLength = 0;
let imageArrayPointer = 0;
let imagePointer = 0;