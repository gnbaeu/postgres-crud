import {mongolScene} from './mongol-scene.js';
// The existing welcome lifecycle owns visibility; this is decoration only.
export function welcomeBackgroundMarkup(){return '<div class="tw-ambient" aria-hidden="true" inert>'+mongolScene('welcome')+'</div>';}
