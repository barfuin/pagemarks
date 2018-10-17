'use strict';

function pagemarksMain() {

    var Shuffle = window.Shuffle;
    var element = document.querySelector('.pagemarks-shuffle-container');

    var shuffleInstance = new Shuffle(element, {
        itemSelector: '.pagemarks-item',
        sizer: '.pagemarks-shuffle-container:first-child'
    });
}