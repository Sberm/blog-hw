async function fetchAllIdsAndRestaurantName() {
    const url = "https://sberm.cn/review/fetch-review-id-resname";
    const data = {
        empty: "empty"
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

function setContent(dataR) {
    let indexDiv = document.getElementsByClassName("content-background")[0];
    let data = dataR.return_review;
    for (let index = 0; index < data.length; index++) {
        let id = data[index].id;
        let restaurantName = data[index].restaurant_name;
        let a = document.createElement("a");
        a.innerHTML = `
            <p class = "p-then">${restaurantName}</p>
        `;
        // open editor page
        a.href = `https://sberm.cn/review/editor?id=${id}`;
        indexDiv.appendChild(a);
    }
}

function createReview() {
    window.location.href = 'https://sberm.cn/review/editor?id=-1';
}

async function main() {
    let data = await fetchAllIdsAndRestaurantName();
    console.log(data);
    setContent(data);
}

main();
