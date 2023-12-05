const searchBtn = document.getElementById("search-button");
const searchInput = document.getElementById("search-text");

const favoritesContainer = document.getElementById("fav-container");
const favoriteMeals = document.getElementById("fav-meals");

const recipesContainer = document.getElementById("recipes-container");
const infoContainer = document.getElementById("info-container");
const closeInfoBtn = document.getElementById("close-btn");
const mealInfo = document.getElementById("meal-info");

getRandomMeals();
fetchFavoriteMeals();

async function getRandomMeals() {
    for (let i = 0; i < 10; i++) {
        const resp = await fetch(
            "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        const respData = await resp.json();
        const randomMeal = respData.meals[0];
    
        addMeal(randomMeal);
    }
    
}

async function getMealById(id) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    );

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData) {

    const meal = document.createElement("div");
    meal.classList.add("recipe-container");

    meal.innerHTML = `
            <div class="stack-img">
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <button class="fav-btn"><i class="fa fa-heart"></i></button>
            </div>
            <h3>${mealData.strMeal}</h3>
            `;

    const favoriteBtn = meal.querySelector(".fav-btn");

    favoriteBtn.addEventListener("click", (event) => {
        if(favoriteBtn.classList.contains("active")) {
            favoriteBtn.classList.remove("active");
            removeMealLS(mealData.idMeal);
        } else {
            favoriteBtn.classList.add("active");
            addMealLS(mealData.idMeal);
        }
        event.stopPropagation();
    }, true);

     meal.addEventListener("click", () => {
        showInfoContainer(mealData);
        window.scrollTo(0, 0);
     });

    recipesContainer.appendChild(meal);

}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));

    fetchFavoriteMeals();
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );

    fetchFavoriteMeals();
}

function showInfoContainer(mealData) {
    infoContainer.classList.remove("hidden");

    mealInfo.innerHTML = "";

    const info = document.createElement("div");

    info.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
    <p>${mealData.strMeal}</p>
    <h3>Ingrediants</h3>
    `;

    const ingrediants = [];

    for (let i = 1; i < 20; i++) {
        if(mealData["strIngredient" + i]) {
            ingrediants.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);
        } else {
            break;
        }
        
    }

    const ingrediantsList = document.createElement("ul");

    ingrediantsList.innerHTML = ingrediants.map((ing) => ("<li>" + ing + "</li>")).join("");
    info.innerHTML += ingrediantsList.innerHTML;



    mealInfo.appendChild(info);
}

closeInfoBtn.addEventListener("click", () => {
    infoContainer.classList.add("hidden");
});

async function fetchFavoriteMeals() {
    favoriteMeals.innerHTML = "";
    favoritesContainer.innerHTML = `<h2>My Favorite Meals</h2>`;

    const mealIds = getMealsLS();

    if(mealIds.length == 0) {
        favoritesContainer.innerHTML += "<h4>Your Favorite Meals Will Appear Here</h4>";
    } else {
        for (let i = 0; i < mealIds.length; i++) {
            let meal = await getMealById(mealIds[i]);
    
            const favoriteMeal = document.createElement("div");
    
            favoriteMeal.classList.add("fav-meal");
    
            favoriteMeal.innerHTML = 
            `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p>${meal.strMeal}</p>
            <button class="clear"><i class="fa fa-close"></i></button>
            `;
    
            const clearBtn = favoriteMeal.querySelector(".clear");
    
            clearBtn.classList.add("hidden");
    
            clearBtn.addEventListener("click", (event) => {
               removeMealLS(meal.idMeal);
               event.stopPropagation();
            }, true);
    
            favoriteMeal.addEventListener("mouseover", () => {
                clearBtn.classList.remove("hidden");
            });
    
            favoriteMeal.addEventListener("mouseout", () => {
                clearBtn.classList.add("hidden");
            });
    
            favoriteMeal.addEventListener("click", () => {
                showInfoContainer(meal);
                window.scrollTo(0, 0);
            });
    
            favoriteMeals.appendChild(favoriteMeal);
        }  

        favoritesContainer.appendChild(favoriteMeals);
    }
}

searchBtn.addEventListener("click", async () => {
    recipesContainer.innerHTML = "";

    const meals = await getMealsBySearch(searchInput.value);

    if(meals) {
        meals.forEach((element) => {
            addMeal(element);
        });
    }
})

