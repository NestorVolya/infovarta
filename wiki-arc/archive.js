"use strict";
let readingSize=20;
try{const saved=Number(localStorage.getItem("infovarta-reading-size"));if(Number.isInteger(saved)&&saved>=18&&saved<=56&&saved%2===0)readingSize=saved;}catch{}
const smaller=document.getElementById("text-smaller"),larger=document.getElementById("text-larger");
function applyReadingSize(){document.documentElement.style.setProperty("--reading-size",readingSize+"px");document.getElementById("text-size-status").textContent="Розмір тексту: "+readingSize+" пікселів";smaller.disabled=readingSize<=18;larger.disabled=readingSize>=56;try{localStorage.setItem("infovarta-reading-size",String(readingSize));}catch{}}
smaller.addEventListener("click",()=>{readingSize=Math.max(18,readingSize-2);applyReadingSize();});
larger.addEventListener("click",()=>{readingSize=Math.min(56,readingSize+2);applyReadingSize();});
applyReadingSize();
