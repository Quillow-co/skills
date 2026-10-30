/*! @quillow/custom-block-sdk
MIT License

Copyright (c) 2026 Quillow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
"use strict";(()=>{var C="quillow:custom-block";function f(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function v(r,o){return f(r)&&r.protocol===C&&r.version===1&&r.type===o}function O(r){if(!f(r)||!f(r.theme)||!f(r.layout))return!1;let{theme:o,layout:n}=r;return["editor","published"].includes(r.environment)&&["light","dark"].includes(o.mode)&&["Normal","Pill","Sharp"].includes(o.cornerStyle)&&f(o.variables)&&Object.entries(o.variables).every(([u,d])=>/^--quillow-[a-z0-9-]+$/.test(u)&&typeof d=="string")&&(o.fontStylesheet===null||typeof o.fontStylesheet=="string"&&w(o.fontStylesheet))&&["1:1","2:1","2:2"].includes(n.size)&&["mobile","desktop"].includes(n.viewport)&&typeof n.width=="number"&&Number.isFinite(n.width)&&n.width>=0&&typeof n.height=="number"&&Number.isFinite(n.height)&&n.height>=0}function w(r){try{return["http:","https:"].includes(new URL(r).protocol)}catch{return!1}}function B(r,o){return{protocol:C,version:1,type:r,...o?{context:o}:{}}}function Q(r={}){let o=r.parentOrigin;if(o&&(!w(o)||new URL(o).origin!==o))throw new Error("parentOrigin must be an HTTP(S) origin");let n,u=!1,d=!1,l,m=new Set,a=new Set,p=new Map,y=new Map,g=new Set,k=e=>{let t=p.get(e);t?.value?document.documentElement.style.setProperty(e,t.value,t.priority):document.documentElement.style.removeProperty(e)},P=e=>{let t=document.documentElement;for(let i of g)i in e.theme.variables||k(i);for(let[i,c]of Object.entries(e.theme.variables))p.has(i)||p.set(i,{value:t.style.getPropertyValue(i),priority:t.style.getPropertyPriority(i)}),t.style.setProperty(i,c);g=new Set(Object.keys(e.theme.variables));let s={"data-quillow-theme":e.theme.mode,"data-quillow-size":e.layout.size,"data-quillow-viewport":e.layout.viewport,"data-quillow-corner-style":e.theme.cornerStyle,"data-quillow-environment":e.environment};for(let[i,c]of Object.entries(s))y.has(i)||y.set(i,t.getAttribute(i)),t.setAttribute(i,c);e.theme.fontStylesheet?(l||(l=document.createElement("link"),l.rel="stylesheet",(document.head??t).append(l)),l.href!==e.theme.fontStylesheet&&(l.href=e.theme.fontStylesheet)):(l?.remove(),l=void 0)},S=()=>window.parent.postMessage(B("ready"),o??"*"),x=(e,t)=>{try{e(t)}catch(s){console.error("[Quillow SDK] Subscriber failed",s)}},E=e=>{if(e.source!==window.parent||!w(e.origin)||o&&e.origin!==o)return;if(v(e.data,"hello")){o=e.origin,S();return}if(!v(e.data,"context")||!O(e.data.context))return;o=e.origin;let t=e.data.context;n=Object.freeze({...t,theme:Object.freeze({...t.theme,variables:Object.freeze({...t.theme.variables})}),layout:Object.freeze({...t.layout})}),r.applyStyles!==!1&&P(n);for(let s of a)s.resolve(n);a.clear();for(let s of m)x(s,n)},h=()=>{if(d)throw new Error("Quillow SDK has been destroyed");if(!u){if(typeof window>"u"||window.parent===window)throw new Error("Quillow SDK requires an embedded browser window");u=!0,window.addEventListener("message",E),S()}};return{start:h,getContext:()=>n,ready({timeout:e=1e4}={}){return new Promise((t,s)=>{if(h(),n){t(n);return}let i=setTimeout(()=>{a.delete(c),s(new Error("Timed out waiting for the Quillow host"))},e),c={resolve:b=>{clearTimeout(i),t(b)},reject:b=>{clearTimeout(i),s(b)}};a.add(c)})},subscribe(e){return h(),m.add(e),n&&x(e,n),()=>{m.delete(e)}},destroy(){if(!d){d=!0,u&&window.removeEventListener("message",E);for(let e of a)e.reject(new Error("Quillow SDK has been destroyed"));a.clear(),m.clear();for(let e of g)k(e);for(let[e,t]of y)t===null?document.documentElement.removeAttribute(e):document.documentElement.setAttribute(e,t);l?.remove(),n=void 0}}}}var j=Q();window.Quillow??=j;window.parent!==window&&window.Quillow.start();})();
