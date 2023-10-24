function currentPage() {
	const queryString = window.location.search;
	const parameters = new URLSearchParams(queryString);
	let page = parameters.get('page');
	if (page == null) {
		page = 1;
	}
	return page;
}

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
	let temp = imageSourceDiv.src.split("/images/");
	let imageSrc = decodeURIComponent("/images/" + temp[temp.length - 1]);

	//console.log("imageSrc:",imageSrc);

    for (let index = 0;index < REVIEW_IMG.length; index++) {
        if (REVIEW_IMG[index].id == metaId) {
            imageArrayPointer = index;
            for (let jndex = 0;jndex < REVIEW_IMG[imageArrayPointer].images.length; jndex++) {

				//console.log("imageSrc in set:",REVIEW_IMG[imageArrayPointer].images[jndex])

				if (imageSrc == REVIEW_IMG[imageArrayPointer].images[jndex]) {
					imagePointer = jndex;
					break;
				}
            }
            break;
        }
    }

	// console.log("current index is", imagePointer);

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

async function setImage(index, da, contentBackground) {
	const id = da.id;
	// image
    let images = await fetchReviewData({isImage: true, id: id});
    let imageBackground = contentBackground.getElementsByClassName("content-container")[index].getElementsByClassName("image-background")[0];
    REVIEW_IMG.push({
        id: id,
        images: images.return_images
    });
	imageBackground.removeChild(imageBackground.lastChild);
    for (let j = 0;j < images.return_images.length; j++) {
        let img = images.return_images[j];
        let imageContainer = document.createElement("div");
        imageContainer.setAttribute("class", "image-container");
        imageContainer.innerHTML = `
            <a href="javascript:void(0);"><img class="review-img" role = "button" alt = "${img}" src = "${img}" onclick = "popUp(this)" metaId = "${id}"/>  </a>
        `
        imageBackground.appendChild(imageContainer);
    }
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
		<div class = "review-date">Review date:&nbsp;&nbsp;${date}</div>
	`

	contentContainer.innerHTML = text;
	
	let imageBackground = contentContainer.getElementsByClassName("image-background")[0];
    for (let j = 0;j < 1; j++) {
        let img = "/images/ZKZg.gif";
        let imageContainer = document.createElement("div");
        imageContainer.setAttribute("class", "image-container");
        imageContainer.innerHTML = `
            <a href="javascript:void(0);"><img class="review-img" role = "button" alt = "${img}" src = "${img}" onclick = "popUp(this)" metaId = "${id}" style="max-height: 3rem; max-width: 3rem; "/>  </a>
        `
        imageBackground.appendChild(imageContainer);
    }

	const MAX_SCORE = 10;

    // rating
	let ratingOutOfFive = rating / 2;
    let ratingRounded = Math.floor(ratingOutOfFive) > MAX_SCORE ? MAX_SCORE : Math.floor(ratingOutOfFive);
    let half_ = false;
    if (ratingOutOfFive - ratingRounded >= 0.5) {
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

	//contentBackground.appendChild(contentContainer);
	//contentBackground.innerHTML += '<hr class = "custom-hr">';
	contentContainer.innerHTML += '<hr class = "custom-hr">'
	
	const lastChild = contentBackground.lastChild;
	contentBackground.insertBefore(contentContainer, lastChild);
}

async function setPaginationBar(pages, cPage) {
	// console.log("pages", pages);
	let pBar = document.getElementById("pagination-bar");

	// 底下显示的页数(实际显示的页数是MAXPAGE+1)
	const MAXPAGE = 6;

	const maxPageCal = Math.ceil(MAXPAGE / 2);
	//for (let i = Math.max(1, cPage - maxPageCal);i <= Math.min(cPage + maxPageCal, pages);i++) {
	let left = Math.max(1, cPage - maxPageCal);
	let right = Math.min(cPage + maxPageCal, pages);
	if (left == 1) {
		right =Math.min(2*maxPageCal + 1, pages);
	}
	if (right == pages) {
		left = Math.max(pages - 2 * maxPageCal, 1);
	}
	for (let i = left;i <= right; i++) {
		let numberDiv = document.createElement("div");
		numberDiv.setAttribute("class", "pagination-number");
		numberDiv.innerHTML = `
			<a href = "/review?page=${i}"><span>${i}</span></a>
		`
		let className;
		if (i == cPage) {
			className = "page current";
		} else {
			className = "page";
		}
		numberDiv.children[0].setAttribute("class", className);
		pBar.appendChild(numberDiv);
	}
	// console.log(pBar);
}


async function onLoad() {
    let data = await fetchReviewData({isData: true});

    var contentBackground = document.createElement('div');
    contentBackground.setAttribute("class", "content-background");
    document.body.appendChild(contentBackground);

	const cPage = currentPage();
	const pBar = document.createElement("div");
	pBar.setAttribute("id", "pagination-bar");
	contentBackground.appendChild(pBar);
	const pages = Math.ceil(data.return_review.length / RECORD_PER_PAGE);
	await setPaginationBar(pages, cPage);

	//content
	for (let index = Math.max(RECORD_PER_PAGE * (cPage - 1) , 0); index < Math.min(RECORD_PER_PAGE * cPage, data.return_review.length); index++) {
        await setContent(data.return_review[index], contentBackground);
    }
	let ite = 0;
	//image
	for (let index = Math.max(RECORD_PER_PAGE * (cPage - 1) , 0); index < Math.min(RECORD_PER_PAGE * cPage, data.return_review.length); index++) {
		await setImage(ite, data.return_review[index], contentBackground);
		ite++;
    }
}

// 存储图片路径
let REVIEW_IMG = [];
let popUpImageLength = 0;
let imageArrayPointer = 0;
let imagePointer = 0;
const RECORD_PER_PAGE = 4;
