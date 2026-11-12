/*
"Talk is cheap. Show me the code."
—Linus Torvalds
*/

// Palabas · WS1 TV Show Search code-along (TVmaze API, no key needed)
// Open DevTools (F12): keep the Console AND the Network tab open.
// Sample or live mode: see config.js.

// ---------- Given: page elements ----------
const form = document.getElementById("searchForm");
const input = document.getElementById("query");
const statusText = document.getElementById("status");
const results = document.getElementById("results");
const dialog = document.getElementById("details");
const detailsBody = document.getElementById("detailsBody");
const closeBtn = document.getElementById("closeDetails");
const modeBadge = document.getElementById("modeBadge");

let currentShows = [];

// ---------- Given: the API's URLs ----------
const API = "https://api.tvmaze.com";

// Turns "Breaking Bad" into "breaking-bad" (used for the sample-data file names)
function slug(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// e.g. https://api.tvmaze.com/search/shows?q=breaking%20bad
function searchURL(query) {
  if (USE_SAMPLE_DATA) return `data/search/${slug(query)}.json`;
  return `${API}/search/shows?q=${encodeURIComponent(query)}`;
}

// e.g. https://api.tvmaze.com/shows/169
function showURL(id) {
  return USE_SAMPLE_DATA ? `data/shows/${id}.json` : `${API}/shows/${id}`;
}

// e.g. https://api.tvmaze.com/shows/169/cast
function castURL(id) {
  return USE_SAMPLE_DATA ? `data/cast/${id}.json` : `${API}/shows/${id}/cast`;
}

// e.g. https://api.tvmaze.com/shows/169/seasons
function seasonsURL(id) {
  return USE_SAMPLE_DATA ? `data/seasons/${id}.json` : `${API}/shows/${id}/seasons`;
}

// ---------- Given: helpers (no need to change) ----------

// Shows a message under the search box. type: "info", "loading" or "error"
function setStatus(message, type = "info") {
  statusText.textContent = message;
  statusText.className = "status " + type;
}

// Makes an element with an optional class and text: el("span", "year", "2008")
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A poster <img>, or a placeholder when the show has no image (image is null)
function createPoster(show, size = "medium") {
  if (!show.image) {
    return el("span", "poster none", "No poster");
  }
  const img = el("img", "poster");
  img.src = show.image[size] || show.image.medium;
  img.alt = `Poster: ${show.name}`;
  img.loading = "lazy";
  img.addEventListener("error", () => img.replaceWith(el("span", "poster none", "No poster")));
  return img;
}

// "2008–2013", or "2016–" for a show that is still running
function yearRange(show) {
  const start = show.premiered ? show.premiered.slice(0, 4) : "?";
  const end = show.ended ? show.ended.slice(0, 4) : "";
  return `${start}–${end}`;
}

// TVmaze summaries contain HTML like "<p><b>Friends</b> follows…</p>".
// This keeps only the text. (Never put text from an API into innerHTML:
// if it contained a <script> or an onerror, it could run on your page.)
function stripTags(html) {
  if (!html) return "No summary yet.";
  return new DOMParser().parseFromString(html, "text/html").body.textContent;
}

// Close the details pop-up (Step 4) with the × button or by clicking outside it
closeBtn.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

// Show which mode we're in
modeBadge.textContent = USE_SAMPLE_DATA ? "Sample data" : "Live · TVmaze";
modeBadge.classList.toggle("live", !USE_SAMPLE_DATA);

// STEP 1 — Your first API request  
// TODO: async function testRequest(): fetch searchURL("friends"), log the status and the JSON array


//it send test request to the tvmaze api and displays the reponse details im the console to check if the API is working.
/*async function testRequest() {
    const response = await fetch(searchURL("friends")); //sends GET request to serach "friends"

    console.log("Request URL:", response.url);
    console.log("Status:", response.status);
    console.log("Response OK:", response.ok);

    const data = await response.json(); //converts reponse into json

    console.log("Whole Data:", data);
    console.log("Array Length:", data.length);
    console.log("First Show Name:", data[0].name);
    console.log("First Show Premiered:", data[0].premiered);
}

testRequest();*/


// STEP 2 — Search and show the results
// TODO: renderResults(items), searchShows(query), and a submit listener on the form

//dis creates a card for each show containing its information
function renderResults(items){ 
  results.innerHTML = " ";

  items.forEach(item => { //loops every  search result
    const show = item.show;

    const card = el("button", "card");
    card.type = "button";
    card.dataset.id = show.id;
    const poster = createPoster(show);
    const title = el("h3", "", show.name);
    const years = el("p", "year", yearRange(show));
    const genres = el("p", "genres", show.genres.join(", "));

    const rating = show.rating.average !== null
          ? "★" + show.rating.average
          : "Not rated yet";

          const ratingText = el("p", "rating", rating);

          card.append(poster, title, years, genres, ratingText);


          results.appendChild(card);
  }

  );
}

//searcges for tv shows using TVmaze API and displays hte results
/*async function searchShows(query){
  const response = await fetch(searchURL(query));
  const data = await response.json();
  renderResults(data);
}*/


form.addEventListener("submit", function(event){ //this handles the search form if user subits a tv show name

  event.preventDefault();

  const query = input.value.trim();

  if(query === ""){
    return;
  }
  searchShows(query);
});


// STEP 3 — getJSON(): one careful helper for every request
// TODO: catch network errors, check 429 and response.ok; rewrite searchShows with try / catch and an empty-array check

//sends a request a req to the API and checks for network and HTTP errors and returns a json data.
async function getJSON(url) {
    let response;

    try {
        response = await fetch(url); //send s request 
    } catch (networkError) {
        throw new Error("Can't reach TVmaze. Check your internet, or use sample mode.");
    }

    if (response.status === 429) {
        throw new Error("Too many requests (429). Wait 10 seconds and try again.");
    }

    if (!response.ok) {
        if (USE_SAMPLE_DATA) {
            throw new Error("Sample not found. Try friends, breaking-bad, or sample.");
        }

        throw new Error(`Request failed (HTTP ${response.status}).`);
    }

    return response.json();
}

//it searches for tv dhows and displays the results and handles errors if the request fals
async function searchShows(query) {

    setStatus(`Searching for "${query}"…`, "loading");
    results.innerHTML = "";

    try {
        const data = await getJSON(searchURL(query));

        currentShows = data;

        if (data.length === 0) { //checks if the api returned an epty list
            setStatus(`No shows found for "${query}".`, "error");
            return;
        }

        renderResults(data);

        const count = data.length;
        const word = count === 1 ? "show" : "shows";

        setStatus(`${count} ${word} found for "${query}".`, "info");

    } catch (error) {
        setStatus(error.message, "error");
    }
}
// STEP 4 — Click a show to see its details
// TODO: one click listener on #results, showDetails(id), renderDetails(show)

//opens details when user cllicks a tv show card
results.addEventListener("click", (event) => {
    const card = event.target.closest(".card");

    if (card) {
        showDetails(card.dataset.id);
    }
});


/*function renderDetails(show) { //dispays a complete info of the selected tv show 
    detailsBody.replaceChildren();

    const poster = createPoster(show, "original");
    const title = el("h2", "", show.name);

    const years = yearRange(show);

    const network = show.network?.name ||
                    show.webChannel?.name ||
                    "Unknown network";

    const runtime = show.runtime ?? show.averageRuntime;
    const runtimeText = runtime != null
        ? `${runtime} min`
        : "Unknown runtime";

    const genres = (show.genres || []).join(", ");

    const information = el(
        "p",
        "show-info",
        `${years} · ${network} · ${genres} · ${runtimeText}`
    );

    const rating = show.rating?.average != null
        ? `★ ${show.rating.average}`
        : "Not rated yet";

    const ratingText = el("p", "rating", rating);

    const summaryTitle = el("h3", "", "Summary");
    const summary = el("p", "summary", stripTags(show.summary));

    const link = el("a", "", "View on TVmaze");
    link.href = show.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    detailsBody.append(
        poster,
        title,
        information,
        ratingText,
        summaryTitle,
        summary,
        link
    );
}

//retrieves inforation of the selected tv show from the api 
async function showDetails(id) {
    detailsBody.replaceChildren(
        el("p", "status loading", "Loading details…")
    );

    dialog.showModal();

    try {
        const show = await getJSON(showURL(id));
        renderDetails(show);
    } catch (error) {
        detailsBody.replaceChildren(
            el("p", "status error", error.message)
        );
    }
}*/




// STEP 5 — Promise.all: show + cast + seasons at the same time
// TODO: rewrite showDetails with Promise.all, and renderDetails(show, cast, seasons)

//displays the selected tv shpw's information such as its summary, seasons and cast
function renderDetails(show, cast, seasons) {
    detailsBody.replaceChildren();

    const poster = createPoster(show, "original");
    const title = el("h2", "", show.name);

    const years = yearRange(show);

    const network = show.network?.name ||
                    show.webChannel?.name ||
                    "Unknown network";

    const runtime = show.runtime ?? show.averageRuntime;
    const runtimeText = runtime != null
        ? `${runtime} min`
        : "Unknown runtime";

    const genres = (show.genres || []).join(", ");

    const information = el(
        "p",
        "show-info",
        `${years} · ${network} · ${genres} · ${runtimeText}`
    );

    const rating = show.rating?.average != null //checks if show has rating
        ? `★ ${show.rating.average}`
        : "Not rated yet";

    const ratingText = el("p", "rating", rating);

    // display the show's summary.
    const summaryTitle = el("h3", "", "Summary");
    const summary = el("p", "summary", stripTags(show.summary));

    // display the number of seasons.
    const seasonCount = seasons.length;
    const seasonWord = seasonCount === 1 ? "season" : "seasons";

    const seasonText = el(
        "p",
        "seasons",
        `${seasonCount} ${seasonWord}`
    );

    const castTitle = el("h3", "", "Cast");
    const list = el("ul", "cast-list");

    cast.slice(0, 6).forEach((member) => {
        const person = member.person?.name || "Unknown person";
        const character = member.character?.name || "Unknown character";

        const li = el("li", "", person + " ");
        li.append(el("span", "", "as " + character));

        list.append(li);
    });

    const link = el("a", "", "View on TVmaze");
    link.href = show.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    detailsBody.append(
        poster,
        title,
        information,
        ratingText,
        summaryTitle,
        summary,
        seasonText,
        castTitle,
        list,
        link
    );
}

async function showDetails(id) { //uses a promise.all on retrieving show's information, cast and sasons and displsys in details dialog
    detailsBody.replaceChildren(
        el("p", "status loading", "Loading details…")
    );

    dialog.showModal();

    try {
        // record the starting time.
        const start = performance.now();

        const [show, cast, seasons] = await Promise.all([ // strt all three request simultaneously.
            getJSON(showURL(id)),
            getJSON(castURL(id)),
            getJSON(seasonsURL(id)),
        ]);

        console.log(
            `3 requests in ${Math.round(performance.now() - start)} ms`
        );

        renderDetails(show, cast, seasons);

    } catch (error) {
        detailsBody.replaceChildren(
            el("p", "status error", error.message)
        );
    }
}

document.getElementById("sortRating").addEventListener("click", () => {
    sortByRating(); //detects when useer clicks the sort button 
});

// sorts shows from highest to lowest rating.
function sortByRating() {
  const sortedShows = [...currentShows].sort((a, b) => {
    const ratingA = a.show.rating?.average ?? -1; //if there is no rating, it shows -1
    const ratingB = b.show.rating?.average ?? -1;

    return ratingB - ratingA;
  });

  renderResults(sortedShows);
}