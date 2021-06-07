// import { async } from "regenerator-runtime"; // fixes regeneratorRuntime error
import * as model from "./model.js";
import {MODAL_CLOSE_SEC} from "./config.js"
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime"; // seems to fix problem fixed by line 1

// if(module.hot) {
//     module.hot.accept();
// };

async function controlRecipes() {
    try {

        const id = window.location.hash.slice(1);

        if(!id) return;

        recipeView.renderSpinner();

        // 0. Update Results View to Mark Selected Search Result
        resultsView.update(model.getSearchResultsPage());
        
        // 1. Updating Bookmarks View
        bookmarksView.update(model.state.bookmarks);

        // 2. Loading Recipe
        await model.loadRecipe(id);
        
        // 3. Rendering Recipe
        recipeView.render(model.state.recipe);

    } catch(err) {

        recipeView.renderError();
        console.error(err);

    };
};

async function controlSearchResults() {
    try {

        resultsView.renderSpinner();

        // 1. Get Search Query
        const query = searchView.getQuery();
        if(!query) return;

        // 2. Load Search Results
        await model.loadSearchResults(query);

        // 3. Render Results
        // resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage());

        // 4. Render Initial Pagination Buttons
        paginationView.render(model.state.search);

    } catch(err) {

        console.log(err);

    };
};

function controlPagination(goToPage) {
    // 1. Render NEW Results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2. Render NEW Pagination Buttons
    paginationView.render(model.state.search);
};

function controlServings(newServings) {
    // 1. Update the Recipe Servings (in state)
    model.updateServings(newServings);

    // 2. Update the View
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

function controlAddBookmark() {
    // 1. Add/remove Bookmark
    if(!model.state.recipe.bookmarked) {
        model.addBookmark(model.state.recipe);
    } else {
        model.deleteBookmark(model.state.recipe.id);
    };

    // 2. Update Recipe View
    recipeView.update(model.state.recipe);

    // 3. Render Bookmarks
    bookmarksView.render(model.state.bookmarks);
};

function controlBookmarks() {
    bookmarksView.render(model.state.bookmarks);
};

async function controlAddRecipe(newRecipe) {
    try {

        // Show loading spinner
        addRecipeView.renderSpinner();

        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render Recipe
        recipeView.render(model.state.recipe);

        // Success Message
        addRecipeView.renderMessage();

        // Render Bookmark View
        bookmarksView.render(model.state.bookmarks);

        // Change ID in URL
        window.history.pushState(null, "", `#${model.state.recipe.id}`);

        // Close Form Window
        setTimeout(function() {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);

        // // Reset Page - added from comments, not lecture...
        // setTimeout(function () {
        //     location.reload();
        // }, 1500);

    } catch(err) {

        console.error("💥", err);
        addRecipeView.renderError(err.message);

    };
};

function init() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
    console.log("Welcome!");
};

init();