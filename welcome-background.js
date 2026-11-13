// Independent, code-native night steppe. No Home scene or raster assets.
export function welcomeBackgroundMarkup(){
 const stars=Array.from({length:42},(_,i)=>{const x=(i*137+31)%960,y=(i*67+19)%330;return `<rect class="tw-star" x="${x}" y="${y}" width="${i%4===0?3:2}" height="2" style="--star-delay:-${i%9}s"/>`;}).join('');
 return `<div class="tw-ambient" aria-hidden="true" inert><svg class="tw-steppe" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice" focusable="false" shape-rendering="crispEdges">
 <path class="tw-sky" d="M0 0h960v640H0z"/>
 <g class="tw-stars">${stars}</g>
 <path class="tw-moon" d="M778 58h24v8h8v24h-8v8h-24v-8h-8V66h8z"/>
 <path class="tw-moon-shade" d="M794 58h8v8h8v24h-8v8h-16v-8h8z"/>
 <g class="tw-cloud"><path d="M90 151h24v-8h32v8h24v8H90zM670 211h30v-8h42v8h32v8H670z"/></g>
 <path class="tw-mountain-far" d="M0 406h48v-20h32v-24h40v-24h32v-24h24v-16h24v24h32v24h32v24h48v20h40v-20h40v-24h32v-24h24v-16h24v16h24v24h32v24h48v20h40v-24h32v-24h24v-24h24v-24h24v24h24v24h32v24h32v24h64v-16h48v-16h32v32h48v234H0z"/>
 <path class="tw-mountain-near" d="M0 450h80v-16h64v-16h80v16h72v16h72v16h96v-16h80v-24h64v-16h56v16h72v24h96v-16h64v16h64v190H0z"/>
 <path class="tw-ground" d="M0 512h128v8h160v-8h144v16h144v-8h176v-8h208v128H0z"/>
 <g class="tw-ger" transform="translate(704 500)"><path class="tw-ger-shadow" d="M-20 62h140v8H-20z"/><path class="tw-ger-roof" d="M40 0h24v8h16v8h16v8h8v8H0v-8h8v-8h16V8h16z"/><path class="tw-ger-wall" d="M0 32h104v30H0z"/><path class="tw-ger-band" d="M0 36h104v4H0zM0 54h104v4H0z"/><path class="tw-ger-door" d="M42 40h20v22H42z"/><path class="tw-ger-window" d="M15 43h12v9H15z"/><path class="tw-ger-frame" d="M20 43h2v9h-2z"/></g>
 </svg></div>`;
}