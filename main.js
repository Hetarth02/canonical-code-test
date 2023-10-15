const API_URL = "https://people.canonical.com/~anthonydillon/wp-json/wp/v2/posts.json";

/**
 * Process API data
 *
 * @param { Object } obj
 * @returns Object
 */
function processApiData(obj) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const date = new Date(obj.date);

    // Problem: 3rd Article does not have any embedded topic
    // Solution: If an embedded topic is available, use it else topic would be 'Miscellaneous'

    const topicArray = obj._embedded["wp:term"].filter((x) =>
        x.find((y) => y.taxonomy === "topic")
    );
    const topic = topicArray[0] ? topicArray[0][0].name : "Miscellaneous";

    const categoryArray = obj._embedded["wp:term"].filter((x) =>
        x.find((y) => y.taxonomy === "category")
    );
    const category = categoryArray[0] ? categoryArray[0][0].name : "Articles";

    return {
        topic: topic,
        link: obj.link,
        imageSource: obj.featured_media,
        title: obj.title.rendered,
        author: {
            link: obj._embedded.author[0].link,
            name: obj._embedded.author[0].name,
        },
        date: `${date.getDate()} ${months[date.getUTCMonth()]} ${date.getFullYear()}`,
        category: category,
    };
}

/**
 * Generate Card from processed API data
 *
 * @param { Object } post
 * @returns string
 */
function generateCard(post) {
    let card = `
        <div class="p-card--highlighted u-no-padding col-4">
            <header>
                <h3 class="p-muted-heading u-no-margin--bottom">${post.topic}</h3>
            </header>
            <div class="p-card__content body">
                <div>
                    <a href="${post.link}" aria-hidden="true" tabindex="-1">
                        <img
                            alt="${post.title}"
                            src=${post.imageSource}
                        />
                    </a>
                </div>
                <h3 class="p-heading--4">
                    <a href="${post.link}">${post.title}</a>
                </h3>
                <p>
                    <em>
                        By
                        <a href="${post.author.link}">${post.author.name}</a>
                        on ${post.date}
                    </em>
                </p>
            </div>
            <p class="p-card__footer footer">${post.category}</p>
        </div>
    `;

    return card;
}

fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
        document.querySelector(".row").innerHTML = data
            .map(processApiData)
            .map(generateCard)
            .join("\n");
    })
    .catch((err) => console.log(err));
