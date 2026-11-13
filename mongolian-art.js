// Original code-native pixel artwork. Decorative only; no interactive hit targets.
export const mongolIcon=(name,className='')=>'<svg class="mn-icon '+className+'" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="/images/mongolian-ui.svg#'+name+'"/></svg>';
export function steppeScene(kind='camp'){
 return '<div class="mn-landscape mn-landscape--'+kind+'" aria-hidden="true" inert><svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMax meet" focusable="false" shape-rendering="crispEdges">'+
 '<path fill="var(--mn-art-sky)" d="M0 0h640v220H0Z"/>'+
 '<g class="mn-camp-stars" fill="var(--mn-gold)"><path d="M86 28h3v3h-3Zm104 17h2v2h-2Zm135-22h3v3h-3Zm160 24h2v2h-2Zm87-24h3v3h-3Z"/></g>'+
 '<g class="mn-steppe-cloud" fill="var(--mn-art-cloud)"><path d="M40 52h12V40h28v-8h24v12h20v8h20v8H40Zm320 0h16V42h24v-8h24v8h20v10h16v8H360Z"/></g>'+
 '<path fill="var(--mn-art-far)" d="M0 138v-16h24v-12h24V98h24V86h24v12h24v12h24v12h24v-12h24V94h24V78h24V62h24v16h24v16h24v16h24v16h24v-12h24v-12h24V86h24V74h24v12h24v12h24v12h24v16h24v-12h24v-12h24V90h24v12h24v12h24v12h40v94H0Z"/>'+
 '<path fill="var(--mn-art-near)" d="M0 162v-12h32v-8h32v-8h32v8h32v12h32v12h32v-8h32v-12h32v-8h32v8h32v12h32v12h32v-8h32v-8h32v8h32v12h32v-8h32v-8h32v8h32v12h64v50H0Z"/>'+
 '<path fill="var(--mn-art-grass)" d="M0 182h640v38H0Z"/>'+
 '<use href="/images/mongolian-ui.svg#ger" x="342" y="94" width="142" height="106"/>'+
 (kind==='camp'?'<use href="/images/mongolian-ui.svg#ger" x="516" y="126" width="92" height="70"/><g class="mn-camp-fire"><path fill="#695442" d="M484 198h24v4h-24Z"/><path class="mn-fire-a" fill="#DA8E4D" d="M488 196v-8h4v-12h4v8h4v-4h4v16Z"/><path class="mn-fire-b" fill="#E5B85B" d="M492 196v-8h4v-8h4v16Z"/></g>':'<path fill="var(--mn-gold)" d="M544 42h16v4h4v16h-4v4h-16v-4h-4V46h4Z"/>')+
 '<path fill="var(--mn-art-far)" d="M24 204h20v2H24Zm134-12h12v2h-12Zm104 18h20v2h-20Zm320-4h18v2h-18Z"/></svg></div>';
}
