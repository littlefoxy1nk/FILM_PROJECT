// variables
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");
const searchResults = document.querySelector(".research-film");
const latestReleases = document.querySelector(".latest-film");
const moviesByGenre = document.querySelector(".genre-film").querySelector(".container");
const popUpFilm = document.querySelector(".popup-film");
const popUpCross = document.querySelector(".close-film");
const popUpLogin = document.querySelector(".popup");
const popupLoginCross = document.querySelector(".close-btn");

const genresByID = {
    28:"Action",
    12:"Adventure",
    16:"Animation",
    35:"Comedy",
    80:"Crime",
    99:"Documentary",
    18:"Drama",
    10751:"Family",
    14:"Fantasy",
    36:"History",
    27:"Horror",
    10402:"Music",
    9648:"Mistery",
    10749:"Romance",
    878:"Science Fiction",
    10770:"TV Movie",
    53:"Thriller",
    10752:"War",
    37:"Wastern",
};
//API authorization
const options = {
    method: 'GET',
    headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMTVlNTMyMzU2NDVjMDhmZThkMjk4ZGNlMzYzNjcwYSIsIm5iZiI6MTczMDkwMzAwNC44MTA5ODEsInN1YiI6IjY3MjhjOTg5NTkxODEzN2NmYzM5YmQzOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dUbXWDEJReBdEZeqZygnCo9Xp2qq0xp1tjBDZG1H-bA'
    }
};
/* --------------------GENERAL FUNCTIONS --------------------------- */
//Create element
const createNewElement = (elementParent, elementType, elementAttribute = "class", attributeValue ="" ) => {
    const newEl = document.createElement(elementType);
    newEl.setAttribute(elementAttribute, attributeValue);
    elementParent.appendChild(newEl);
    return newEl;
};
// FILL THE SWIPER
const createSwiper = ( movieArr, div ,type ,str="") => {
    const container = createNewElement(div, "div","class", "container") //container
    //h2
    const h2 = createNewElement(container, "h2"); 
    h2.innerHTML = `${type} ${str}`;          
    //swiper container
    const swiperContainer = createNewElement(container, "div", "class", "swiper")
    swiperContainer.classList.add("swiper-container");
    const wrapper = createNewElement(swiperContainer, "div", "class", "swiper-wrapper"); // wrapper
    //swiper
    const swiper = new Swiper( swiperContainer, {
        slidesPerView: 4, 
        spaceBetween: 1, 
        navigation: {
            nextEl: createNewElement(container, "div", "class", "swiper-button-next"),
            prevEl: createNewElement(container, "div", "class","swiper-button-prev"),
        },
        mousewheel:true,
    });
    //images
    const posterArr = getPosterURL(movieArr);
    displayImages(movieArr, posterArr, wrapper);
};
//call API for images and add event listener to them
const displayImages = (movieArr, posterArr, wrapper) => {
    for(let i = 0; i < 20; i++){
        if (posterArr[i]){
            const poster_path = `https://image.tmdb.org/t/p/w500${posterArr[i]}`;
            const slide = createNewElement(wrapper, "div", "class", "swiper-slide");
            const img = createNewElement(slide,"img", "src", poster_path)
            slide.addEventListener("click", () =>{
                displayMoviePopUp(movieArr[i], poster_path);
                popUpFilm.style.display = "block";
            });
            hoverInfoEvent(slide, movieArr[i]);
            slide.appendChild(img);
        }
    }
};

/* ----------------------------- SERCHING MOVIES -------------------- */

//Search button click
searchButton.addEventListener("click", ()=>{
    const words = searchInput.value.trim();
    if(words){
        searchResults.innerHTML = "";
        callOnSearch(words)
    };
    searchInput.value = "";
});
//Enter Key push 
searchInput.addEventListener("keyup", (e)=> {
    const words = searchInput.value.trim();
    if(words && e.code === "Enter"){
        searchResults.innerHTML = "";
        callOnSearch(words);
        searchInput.value = "";
    }
});

const callOnSearch = async (str) => {
    const response  = await fetch(`https://api.themoviedb.org/3/search/movie?query=${str}&include_adult=false&language=en-US&page=1&sort_by=vote_average.asc`, options)
    const myObj = await response.json();
    createSwiper(myObj.results, searchResults, "Results for ",str);
};
//return anarray of poster paths 
const getPosterURL = (arr) => {
    const postersURL = [];
    arr.forEach(movie => postersURL.push(movie.poster_path));
    return postersURL;
};

/* ----------------------------- LATEST RELEASES ----------------------- */

//display on page load
window.addEventListener("load", () =>{
    latestOnLoad();
});

//call api on load for latest releases
const latestOnLoad =async () =>{
    const response = await fetch("https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&primary_release_year=2024&release_date.lte=2024-11-06&sort_by=primary_release_date.desc&vote_average.gte=0.1&vote_average.lte=10", options);
    const myObj = await response.json(); 
    createSwiper( myObj.results, latestReleases,"Latest releases");
};

/* ------------------------------ MOVIE POPOUP ------------------------- */

//close popUp
popUpCross.addEventListener("click", ()=>{
    popUpFilm.style.display = "none";
    document.querySelector("body").style.overflow = "auto";
    document.querySelector(".film").style.filter = "blur(0px)"
});
const displayMoviePopUp = async (movie, image) => {
    document.querySelector("body").style.overflow = "hidden";
    const popUpContent = document.querySelector(".popup-film-content");
    document.querySelector(".film").style.filter = "blur(5px)"
    popUpContent.querySelector("img").setAttribute("src", image);
    popUpContent.querySelector("#title-film").textContent = movie.title;
    popUpContent.querySelector("#date").textContent = movie.release_date.split("-")[0];
    popUpContent.querySelector("#rate").innerHTML = `<img src='Vector-2.png'> ${movie.vote_average}`;
    popUpContent.querySelector("#genre").textContent = getGenres(movie.genre_ids); 
    popUpContent.querySelector("#synopsis").textContent = movie.overview;
    popUpContent.querySelector("#people").textContent =await getCast(movie.id);
};
const getGenres= (ids) => {
    const myArr = [];
    for(let id of ids){
        myArr.push(genresByID[id]);
    }
    return myArr.join(" / ");
};
const getCast = async (id) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, options);
    const myObj = await response.json();
    const castArr = await myObj.cast;
    const cast = [];
    castArr.forEach((person,index) => {
        if(index < 5)cast.push(person.name);
    });
    return cast.join(', ')
};

/* ---------------------------- MOVIES BY GENRES ------------------------ */
const navGenre = document.querySelector(".nav-genre");

//LOAD GENRES ON WINDOWS LOAD
window.addEventListener("load", ()=>{
    genreOnLoad();
})
const genreOnLoad = async () => {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=primary_release_date.desc&vote_average.gte=0.1&with_genres=35`, options)
    const myObj = await response.json(); 
    createSwiper( myObj.results, moviesByGenre,"Results for: Comedy");
}

const callByGenre = async (genreID, genre) => {
    if(moviesByGenre.querySelector(".container")){
        moviesByGenre.removeChild(moviesByGenre.querySelector(".container"))
    }
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=primary_release_date.desc&vote_average.gte=0.1&with_genres=${genreID}`, options)
    const myObj = await response.json();
    createSwiper(myObj.results, moviesByGenre,"Results for: " + genre);
};

navGenre.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const genreTab = e.target;
    switch(genreTab.innerText){
        case "COMEDY":
            callByGenre(35, genreTab.innerText);
            break;
        case "DRAMA":
            callByGenre(18, genreTab.innerText);
            break;
        case "ACTION":
            callByGenre(28, genreTab.innerText);
            break;
        case "FANTASY":
            callByGenre(14, genreTab.innerText);
            break;
        case "ANIMATION":
            callByGenre(16, genreTab.innerText);
            break;    
    }
});

/* ------------------------ HOVER INFO ---------------------------------- */

const hoverInfoEvent = (slide, movie) => {
    slide.addEventListener("mouseover", (e) => {
        e.stopPropagation()
        displayInfo(e.target, movie);
    })
};
const displayInfo = (slide, movie) => {
    const hoverDescription = createNewElement(slide, "div", "class", "hover-description");
    const titleFilm = createNewElement(hoverDescription, "p", "id", "title-film");
    titleFilm.textContent = movie.title;
    const date = createNewElement(hoverDescription, "p", "id", "date");
    date.textContent = movie.release_date.split("-")[0];
    const genre = createNewElement(hoverDescription, "p", "id", "genre");
    genre.textContent = getGenres(movie.genre_ids);
    const star = createNewElement(hoverDescription, "p", "id", "star");
    createNewElement(star, "img", "src", "Vector-2.png");
    const rate = createNewElement(hoverDescription, "p", "id", "rate");
    rate.textContent = movie.vote_average;
};

/* ----------------------- SIGNIN / REGISTER POPUP ---------------------- */
const registerTabs = document.querySelectorAll(".openSignup");
const loginTabs = document.querySelectorAll(".openLoging");

registerTabs.forEach(el => {
    el.addEventListener("click", () => {
        popUpLogin.style.display = "flex";
        document.querySelector("body").style.overflow = "hidden";
        document.querySelector(".film").style.filter = "blur(5px)"
    })
});

loginTabs.forEach(el => {
    el.addEventListener("click", () => {
        popUpLogin.style.display = "flex";
        document.querySelector("body").style.overflow = "hidden";
        document.querySelector("#sign-up").classList.remove("active");
        document.querySelector("#register").classList.add("active");
        const signUpTab = document.querySelector(".tabs");
        signUpTab.nextElementSibling.classList.add("active");
        signUpTab.classList.remove("active");
        document.querySelector(".film").style.filter = "blur(5px)"
    })
});

const tabs = document.querySelector(".choose").querySelectorAll("li");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(tab => {
            tab.classList.toggle("active");
        })
    })
});

popupLoginCross.addEventListener("click", () => {
    popUpLogin.style.display = "none";
    document.querySelector("body").style.overflow = "auto";
    document.querySelector(".film").style.filter = "blur(0px)"
});



// pointer sur les images
// images 100% du parent 
// le x dans le movie popUp



