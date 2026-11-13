import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MOVIES, FOODS, MOVIE_GENRES, FOOD_CATEGORIES } from "../randomizer-data.js";
import { RANDOMIZER_COPY } from "../randomizer-copy.js";
import { eligibleItems, toggleSelection, randomIndex, pickItem, readCollection, writeCollection, rememberDraw, toggleFavorite, storageKey } from "../randomizer-core.js";

assert.equal(MOVIE_GENRES.length,19);
assert.equal(FOOD_CATEGORIES.length,12);
for (const [items, categories, type] of [[MOVIES,MOVIE_GENRES,"movie"],[FOODS,FOOD_CATEGORIES,"food"]]) {
  assert.equal(new Set(items.map(item => item.id)).size,items.length,"Item IDs must be unique.");
  const known = new Set(categories.map(category => category.id));
  for (const item of items) {
    const ids = item.genres || item.categories;
    assert.ok(ids.length > 0 && ids.every(id => known.has(id)),item.id + " has valid classifications.");
    for (const locale of ["mn","en","ja"]) {
      assert.ok((item.summary || item.description)[locale]?.trim(),item.id + " has localized editorial content.");
      if (type === "food") assert.ok(item.names[locale]?.trim());
    }
  }
  for (const category of categories) assert.ok(items.some(item => (item.genres || item.categories).includes(category.id)),category.id + " is represented.");
  assert.equal(eligibleItems(items,[],"any").length,items.length);
  assert.equal(eligibleItems(items,[],"all").length,items.length);
}
let selection = [];
for (const genre of MOVIE_GENRES.slice(0,5)) selection = toggleSelection(selection,genre.id).values;
assert.equal(selection.length,5);
const rejected = toggleSelection(selection,"documentary");
assert.equal(rejected.limited,true);
assert.deepEqual(rejected.values,selection);
selection = toggleSelection(selection,selection[0]).values;
assert.equal(selection.length,4,"Any chip can be deselected at the limit.");
assert.equal(toggleSelection(selection,"documentary").values.length,5);

const action = eligibleItems(MOVIES,["action"],"any");
assert.ok(action.length > 1 && action.every(item => item.genres.includes("action")));
const selected = ["action","science-fiction","thriller"];
const any = eligibleItems(MOVIES,selected,"any");
const all = eligibleItems(MOVIES,selected,"all");
assert.ok(any.length > all.length && all.length > 1);
assert.ok(any.every(item => selected.some(id => item.genres.includes(id))));
assert.ok(all.every(item => selected.every(id => item.genres.includes(id))));
assert.equal(eligibleItems(MOVIES,["documentary","western"],"all").length,0);
assert.ok(eligibleItems(FOODS,["japanese","vegetarian"],"all").every(item => item.categories.includes("japanese") && item.categories.includes("vegetarian")));
assert.equal(eligibleItems(FOODS,["japanese","mongolian"],"all").length,0);
assert.equal(eligibleItems([MOVIES[0],MOVIES[0]],[]).length,1,"Duplicate records do not bias the pool.");
for (let count=0;count<100;count++) {
  const result = pickItem(all,all[0].id);
  assert.ok(result && result.id !== all[0].id && all.includes(result));
}
assert.equal(pickItem([]),null);
assert.equal(pickItem([MOVIES[0]],MOVIES[0].id),MOVIES[0],"Single-item pools remain usable.");
let samples = [0xffffffff,4];
assert.equal(randomIndex(3,{getRandomValues(array){array[0]=samples.shift();}}),1,"Out-of-range crypto samples are rejected.");
assert.equal(samples.length,0);
assert.equal(randomIndex(3,null,()=>.999),2,"Fallback remains inside the pool.");
assert.equal(randomIndex(0),-1);

const memory = new Map();
const storage = { getItem:key=>memory.get(key) ?? null,setItem:(key,value)=>memory.set(key,value) };
const movies = {favorites:toggleFavorite([],"arrival"),history:rememberDraw([],"arrival",123)};
assert.equal(writeCollection(storage,"movie",movies),true);
assert.deepEqual(readCollection(storage,"movie",MOVIES),movies);
assert.deepEqual(readCollection(storage,"food",FOODS),{favorites:[],history:[]},"Food and movie persistence stay separate.");
assert.deepEqual(toggleFavorite(movies.favorites,"arrival"),[]);
let history = [];
for (let index=0;index<15;index++) history = rememberDraw(history,MOVIES[index].id,index);
assert.equal(history.length,10);
assert.equal(history[0].id,MOVIES[14].id);
assert.equal(rememberDraw(history,history[0].id,999).filter(entry=>entry.id===history[0].id).length,1);
memory.set(storageKey("movie"),"{broken");
assert.deepEqual(readCollection(storage,"movie",MOVIES),{favorites:[],history:[]});
memory.set(storageKey("movie"),JSON.stringify({favorites:["<script>","arrival","arrival"],history:[null,{id:"missing",at:3},{id:"arrival",at:"bad"}]}));
assert.deepEqual(readCollection(storage,"movie",MOVIES),{favorites:["arrival"],history:[]});
assert.deepEqual(readCollection({getItem(){throw Error("denied");}},"movie",MOVIES),{favorites:[],history:[]});
assert.equal(writeCollection({setItem(){throw Error("quota");}},"movie",movies),false);
for (const locale of ["mn","en","ja"]) {
  assert.deepEqual(Object.keys(RANDOMIZER_COPY[locale]).sort(),Object.keys(RANDOMIZER_COPY.en).sort(),"Every UI key has all three translations.");
  assert.ok(Object.values(RANDOMIZER_COPY[locale]).every(value=>typeof value==="string" && value.trim()));
}
const routes=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url),"utf8")).rewrites;
for(const path of ["/randomizer","/randomizer/movie","/randomizer/food"]) assert.ok(routes.some(route=>route.source===path && route.destination==="/"));
assert.ok(!routes.some(route=>route.source.startsWith("/api")),"Randomizer rewrites do not capture API routes.");
console.log("Randomizer checks passed: " + MOVIES.length + " movies / 19 genres; " + FOODS.length + " foods / 12 categories; filtering, cap, unbiased selection, no-repeat, storage and MN/EN/JA.");
