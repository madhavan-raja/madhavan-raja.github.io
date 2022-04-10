var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function r(t){t.forEach(e)}function i(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function o(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function s(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function u(t){return document.createElement(t)}function f(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function m(t){return document.createTextNode(t)}function h(){return m(" ")}function p(){return m("")}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}let $;function v(t){$=t}const x=[],k=[],w=[],b=[],y=Promise.resolve();let C=!1;function j(t){w.push(t)}const _=new Set;let M=0;function S(){const t=$;do{for(;M<x.length;){const t=x[M];M++,v(t),z(t.$$)}for(v(null),x.length=0,M=0;k.length;)k.pop()();for(let t=0;t<w.length;t+=1){const e=w[t];_.has(e)||(_.add(e),e())}w.length=0}while(x.length);for(;b.length;)b.pop()();C=!1,_.clear(),v(t)}function z(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(j)}}const L=new Set;let D;function A(){D={r:0,c:[],p:D}}function B(){D.r||r(D.c),D=D.p}function H(t,e){t&&t.i&&(L.delete(t),t.i(e))}function T(t,e,n,r){if(t&&t.o){if(L.has(t))return;L.add(t),D.c.push((()=>{L.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}}function V(t){t&&t.c()}function E(t,n,l,o){const{fragment:a,on_mount:c,on_destroy:s,after_update:u}=t.$$;a&&a.m(n,l),o||j((()=>{const n=c.map(e).filter(i);s?s.push(...n):r(n),t.$$.on_mount=[]})),u.forEach(j)}function N(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function I(t,e){-1===t.$$.dirty[0]&&(x.push(t),C||(C=!0,y.then(S)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function F(e,i,l,o,a,s,u,f=[-1]){const m=$;v(e);const h=e.$$={fragment:null,ctx:null,props:s,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(i.context||(m?m.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:i.target||m.$$.root};u&&u(h.root);let p=!1;if(h.ctx=l?l(e,i.props||{},((t,n,...r)=>{const i=r.length?r[0]:n;return h.ctx&&a(h.ctx[t],h.ctx[t]=i)&&(!h.skip_bound&&h.bound[t]&&h.bound[t](i),p&&I(e,t)),n})):[],h.update(),p=!0,r(h.before_update),h.fragment=!!o&&o(h.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);h.fragment&&h.fragment.l(t),t.forEach(c)}else h.fragment&&h.fragment.c();i.intro&&H(e.$$.fragment),E(e,i.target,i.anchor,i.customElement),S()}v(m)}class P{$destroy(){N(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function R(e){let n,r,i;return{c(){n=u("div"),n.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-link" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>',d(n,"class","fixed top-5 right-5 cursor-pointer group print:hidden")},m(t,l){var o,c,s,u;a(t,n,l),r||(o=n,c="click",s=e[0],o.addEventListener(c,s,u),i=()=>o.removeEventListener(c,s,u),r=!0)},p:t,i:t,o:t,d(t){t&&c(n),r=!1,i()}}}function O(t){return[function(){let t=document.querySelector("html").classList;"dark"==localStorage.theme?(t.remove("dark"),localStorage.removeItem("theme")):(t.add("dark"),localStorage.theme="dark")}]}class q extends P{constructor(t){super(),F(this,t,O,R,l,{})}}function G(e){let n,r,i,l;return{c(){n=u("div"),r=u("h1"),r.textContent=`${J}`,i=h(),l=u("p"),l.textContent=`${K}`,d(r,"class","text-4xl text-center text-vivid"),d(l,"class","text-vivid leading-tight text-justify"),d(n,"class","space-y-5")},m(t,e){a(t,n,e),o(n,r),o(n,i),o(n,l)},p:t,i:t,o:t,d(t){t&&c(n)}}}let J="Madhavan Raja",K="Hi! I'm a software engineer, full-stack developer, competitive programmer and a research enthusiast. I am interested in Deep Learning and Computer Vision.";class Q extends P{constructor(t){super(),F(this,t,null,G,l,{})}}function U(e){let n,r,i,l,s,f,p,$,v,x,k,w,b;return{c(){n=u("div"),r=u("a"),i=u("h3"),l=m(e[0]),s=h(),f=u("p"),p=m(e[1]),$=h(),v=u("p"),x=m(e[2]),k=h(),w=u("span"),b=m(e[3]),d(i,"class","text-item-heading mb-1 text-link print:text-vivid"),d(f,"class","text-sm text-vivid group-hover:text-link"),d(v,"class","text-sm text-muted group-hover:text-link"),d(w,"class","text-link hidden print:block"),d(r,"href",e[3]),d(n,"class","group")},m(t,e){a(t,n,e),o(n,r),o(r,i),o(i,l),o(r,s),o(r,f),o(f,p),o(r,$),o(r,v),o(v,x),o(r,k),o(r,w),o(w,b)},p(t,[e]){1&e&&g(l,t[0]),2&e&&g(p,t[1]),4&e&&g(x,t[2]),8&e&&g(b,t[3]),8&e&&d(r,"href",t[3])},i:t,o:t,d(t){t&&c(n)}}}function Z(t,e,n){let{name:r}=e,{authors:i}=e,{journal:l}=e,{link:o}=e;return t.$$set=t=>{"name"in t&&n(0,r=t.name),"authors"in t&&n(1,i=t.authors),"journal"in t&&n(2,l=t.journal),"link"in t&&n(3,o=t.link)},[r,i,l,o]}class W extends P{constructor(t){super(),F(this,t,Z,U,l,{name:0,authors:1,journal:2,link:3})}}function X(t,e,n){const r=t.slice();return r[1]=e[n],r}function Y(e){let n,r;return n=new W({props:{name:e[1].name,authors:e[1].authors,journal:e[1].journal,link:e[1].link}}),{c(){V(n.$$.fragment)},m(t,e){E(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){T(n.$$.fragment,t),r=!1},d(t){N(n,t)}}}function tt(t){let e,n,r=t[0].length>0&&function(t){let e,n,r,i,l=t[0],f=[];for(let e=0;e<l.length;e+=1)f[e]=Y(X(t,l,e));const m=t=>T(f[t],1,1,(()=>{f[t]=null}));return{c(){e=u("div"),n=u("h2"),n.textContent="Research Publications",r=h();for(let t=0;t<f.length;t+=1)f[t].c();d(n,"class","text-section-heading"),d(e,"class","item-spacing")},m(t,l){a(t,e,l),o(e,n),o(e,r);for(let t=0;t<f.length;t+=1)f[t].m(e,null);i=!0},p(t,n){if(1&n){let r;for(l=t[0],r=0;r<l.length;r+=1){const i=X(t,l,r);f[r]?(f[r].p(i,n),H(f[r],1)):(f[r]=Y(i),f[r].c(),H(f[r],1),f[r].m(e,null))}for(A(),r=l.length;r<f.length;r+=1)m(r);B()}},i(t){if(!i){for(let t=0;t<l.length;t+=1)H(f[t]);i=!0}},o(t){f=f.filter(Boolean);for(let t=0;t<f.length;t+=1)T(f[t]);i=!1},d(t){t&&c(e),s(f,t)}}}(t);return{c(){r&&r.c(),e=p()},m(t,i){r&&r.m(t,i),a(t,e,i),n=!0},p(t,[e]){t[0].length>0&&r.p(t,e)},i(t){n||(H(r),n=!0)},o(t){T(r),n=!1},d(t){r&&r.d(t),t&&c(e)}}}function et(t){return[[{name:"Violence Detection in CCTV footage using Deep Learning with Optical Flow in inconsistent weather and lighting conditions",authors:"R Madhavan, Utkarsh, JV Vidhya",journal:"Springer (CCIS, volume 1440), 2021",link:"https://link.springer.com/chapter/10.1007/978-3-030-81462-5_56"}]]}class nt extends P{constructor(t){super(),F(this,t,et,tt,l,{})}}function rt(e){let n,r,i,l,s,f,p,$,v,x,k,w,b,y,C,j;return{c(){n=u("div"),r=u("a"),i=u("h3"),l=m(e[0]),s=h(),f=u("p"),p=u("span"),$=m(e[2]),v=m(" • "),x=m(e[3]),k=m(" ("),w=m(e[4]),b=m(")"),y=h(),C=u("div"),j=m(e[1]),d(i,"class","text-item-heading mb-1 text-link print:text-vivid"),d(p,"class","font-mono"),d(f,"class","text-sm text-muted group-hover:text-link print:text-vivid"),d(C,"class","text-sm text-link hidden print:block"),d(r,"href",e[1]),d(n,"class","group")},m(t,e){a(t,n,e),o(n,r),o(r,i),o(i,l),o(r,s),o(r,f),o(f,p),o(p,$),o(f,v),o(f,x),o(f,k),o(f,w),o(f,b),o(r,y),o(r,C),o(C,j)},p(t,[e]){1&e&&g(l,t[0]),4&e&&g($,t[2]),8&e&&g(x,t[3]),16&e&&g(w,t[4]),2&e&&g(j,t[1]),2&e&&d(r,"href",t[1])},i:t,o:t,d(t){t&&c(n)}}}function it(t,e,n){let{platformName:r}=e,{link:i}=e,{username:l}=e,{rating:o}=e,{ratingDescription:a}=e;return t.$$set=t=>{"platformName"in t&&n(0,r=t.platformName),"link"in t&&n(1,i=t.link),"username"in t&&n(2,l=t.username),"rating"in t&&n(3,o=t.rating),"ratingDescription"in t&&n(4,a=t.ratingDescription)},[r,i,l,o,a]}class lt extends P{constructor(t){super(),F(this,t,it,rt,l,{platformName:0,link:1,username:2,rating:3,ratingDescription:4})}}function ot(t,e,n){const r=t.slice();return r[1]=e[n],r}function at(e){let n,r;return n=new lt({props:{platformName:e[1].name,link:e[1].link,username:e[1].username,rating:e[1].rating,ratingDescription:e[1].ratingDescription}}),{c(){V(n.$$.fragment)},m(t,e){E(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){T(n.$$.fragment,t),r=!1},d(t){N(n,t)}}}function ct(t){let e,n,r=t[0].length>0&&function(t){let e,n,r,i,l=t[0],f=[];for(let e=0;e<l.length;e+=1)f[e]=at(ot(t,l,e));const m=t=>T(f[t],1,1,(()=>{f[t]=null}));return{c(){e=u("div"),n=u("h2"),n.textContent="Competitive Programming",r=h();for(let t=0;t<f.length;t+=1)f[t].c();d(n,"class","text-section-heading"),d(e,"class","item-spacing")},m(t,l){a(t,e,l),o(e,n),o(e,r);for(let t=0;t<f.length;t+=1)f[t].m(e,null);i=!0},p(t,n){if(1&n){let r;for(l=t[0],r=0;r<l.length;r+=1){const i=ot(t,l,r);f[r]?(f[r].p(i,n),H(f[r],1)):(f[r]=at(i),f[r].c(),H(f[r],1),f[r].m(e,null))}for(A(),r=l.length;r<f.length;r+=1)m(r);B()}},i(t){if(!i){for(let t=0;t<l.length;t+=1)H(f[t]);i=!0}},o(t){f=f.filter(Boolean);for(let t=0;t<f.length;t+=1)T(f[t]);i=!1},d(t){t&&c(e),s(f,t)}}}(t);return{c(){r&&r.c(),e=p()},m(t,i){r&&r.m(t,i),a(t,e,i),n=!0},p(t,[e]){t[0].length>0&&r.p(t,e)},i(t){n||(H(r),n=!0)},o(t){T(r),n=!1},d(t){r&&r.d(t),t&&c(e)}}}function st(t){return[[{name:"CodeChef",username:"flipped_flop",link:"https://www.codechef.com/users/flipped_flop",rating:1862,ratingDescription:"4★"},{name:"Codeforces",username:"madhavan_raja",link:"https://codeforces.com/profile/madhavan_raja",rating:1586,ratingDescription:"Specialist"}]]}class ut extends P{constructor(t){super(),F(this,t,st,ct,l,{})}}function ft(e){let n,r,i,l,s,f,p,$,v,x;return{c(){n=u("div"),r=u("a"),i=u("h3"),l=m(e[0]),s=h(),f=u("p"),p=m(e[2]),$=h(),v=u("span"),x=m(e[1]),d(i,"class","text-item-heading mb-1 text-link print:text-vivid"),d(f,"class","text-sm text-muted group-hover:text-link"),d(v,"class","text-sm text-link hidden print:block"),d(r,"href",e[1]),d(n,"class","group")},m(t,e){a(t,n,e),o(n,r),o(r,i),o(i,l),o(r,s),o(r,f),o(f,p),o(r,$),o(r,v),o(v,x)},p(t,[e]){1&e&&g(l,t[0]),4&e&&g(p,t[2]),2&e&&g(x,t[1]),2&e&&d(r,"href",t[1])},i:t,o:t,d(t){t&&c(n)}}}function mt(t,e,n){let{name:r}=e,{link:i}=e,{description:l}=e;return t.$$set=t=>{"name"in t&&n(0,r=t.name),"link"in t&&n(1,i=t.link),"description"in t&&n(2,l=t.description)},[r,i,l]}class ht extends P{constructor(t){super(),F(this,t,mt,ft,l,{name:0,link:1,description:2})}}function pt(t,e,n){const r=t.slice();return r[1]=e[n],r}function dt(e){let n,r;return n=new ht({props:{name:e[1].name,link:e[1].link,description:e[1].description}}),{c(){V(n.$$.fragment)},m(t,e){E(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){T(n.$$.fragment,t),r=!1},d(t){N(n,t)}}}function gt(t){let e,n,r=t[0].length>0&&function(t){let e,n,r,i,l=t[0],f=[];for(let e=0;e<l.length;e+=1)f[e]=dt(pt(t,l,e));const m=t=>T(f[t],1,1,(()=>{f[t]=null}));return{c(){e=u("div"),n=u("h2"),n.textContent="Projects",r=h();for(let t=0;t<f.length;t+=1)f[t].c();d(n,"class","text-section-heading"),d(e,"class","item-spacing")},m(t,l){a(t,e,l),o(e,n),o(e,r);for(let t=0;t<f.length;t+=1)f[t].m(e,null);i=!0},p(t,n){if(1&n){let r;for(l=t[0],r=0;r<l.length;r+=1){const i=pt(t,l,r);f[r]?(f[r].p(i,n),H(f[r],1)):(f[r]=dt(i),f[r].c(),H(f[r],1),f[r].m(e,null))}for(A(),r=l.length;r<f.length;r+=1)m(r);B()}},i(t){if(!i){for(let t=0;t<l.length;t+=1)H(f[t]);i=!0}},o(t){f=f.filter(Boolean);for(let t=0;t<f.length;t+=1)T(f[t]);i=!1},d(t){t&&c(e),s(f,t)}}}(t);return{c(){r&&r.c(),e=p()},m(t,i){r&&r.m(t,i),a(t,e,i),n=!0},p(t,[e]){t[0].length>0&&r.p(t,e)},i(t){n||(H(r),n=!0)},o(t){T(r),n=!1},d(t){r&&r.d(t),t&&c(e)}}}function $t(t){return[[{name:"FurDB",link:"https://github.com/madhavan-raja/furdb",description:"A small and space-efficient Database Management System."},{name:"Misere Tic Tac Toe AI",link:"https://github.com/madhavan-raja/misere-tic-tac-toe-ml",description:"Regression Learning for a variation of a Tic Tac Toe game."},{name:"Ligh",link:"https://github.com/madhavan-raja/ligh",description:"A full-stack blog website written in Flask, Python, SQLAlchemy, HTML (Jinja), and CSS."},{name:"Procedural Music Generator",link:"https://github.com/madhavan-raja/procedural-music-generator",description:"Generates endless music from a given key and scale."},{name:"Reverse Flappy Bird",link:"https://github.com/madhavan-raja/reverse-flappy-bird",description:"A variation of the Flappy Bird game."}]]}class vt extends P{constructor(t){super(),F(this,t,$t,gt,l,{})}}function xt(t,e,n){const r=t.slice();return r[3]=e[n],r}function kt(t){let e,n;return{c(){e=f("path"),d(e,"d",n=t[3])},m(t,n){a(t,e,n)},p(t,r){4&r&&n!==(n=t[3])&&d(e,"d",n)},d(t){t&&c(e)}}}function wt(e){let n,r,i,l,p,$,v,x,k,w,b,y=e[2],C=[];for(let t=0;t<y.length;t+=1)C[t]=kt(xt(e,y,t));return{c(){n=u("a"),r=f("svg"),i=f("title"),l=m(e[0]);for(let t=0;t<C.length;t+=1)C[t].c();p=h(),$=u("div"),v=u("div"),x=m(e[0]),k=m(": "),w=u("span"),b=m(e[1]),d(r,"xmlns","http://www.w3.org/2000/svg"),d(r,"class","h-7 w-7 text-link"),d(r,"viewBox","0 0 24 24"),d(r,"fill","currentColor"),d(n,"class","print:hidden"),d(n,"href",e[1]),d(w,"class","text-link"),d(v,"class","text-vivid"),d($,"class","hidden print:block")},m(t,e){a(t,n,e),o(n,r),o(r,i),o(i,l);for(let t=0;t<C.length;t+=1)C[t].m(r,null);a(t,p,e),a(t,$,e),o($,v),o(v,x),o(v,k),o(v,w),o(w,b)},p(t,[e]){if(1&e&&g(l,t[0]),4&e){let n;for(y=t[2],n=0;n<y.length;n+=1){const i=xt(t,y,n);C[n]?C[n].p(i,e):(C[n]=kt(i),C[n].c(),C[n].m(r,null))}for(;n<C.length;n+=1)C[n].d(1);C.length=y.length}2&e&&d(n,"href",t[1]),1&e&&g(x,t[0]),2&e&&g(b,t[1])},i:t,o:t,d(t){t&&c(n),s(C,t),t&&c(p),t&&c($)}}}function bt(t,e,n){let{name:r}=e,{link:i}=e,{paths:l}=e;return t.$$set=t=>{"name"in t&&n(0,r=t.name),"link"in t&&n(1,i=t.link),"paths"in t&&n(2,l=t.paths)},[r,i,l]}class yt extends P{constructor(t){super(),F(this,t,bt,wt,l,{name:0,link:1,paths:2})}}function Ct(t,e,n){const r=t.slice();return r[2]=e[n],r}function jt(t,e,n){const r=t.slice();return r[2]=e[n],r}function _t(e){let n,r;return n=new yt({props:{name:e[2].name,link:e[2].link,paths:e[2].paths}}),{c(){V(n.$$.fragment)},m(t,e){E(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){T(n.$$.fragment,t),r=!1},d(t){N(n,t)}}}function Mt(e){let n,r;return n=new yt({props:{name:e[2].name,link:e[2].link,paths:e[2].paths}}),{c(){V(n.$$.fragment)},m(t,e){E(n,t,e),r=!0},p:t,i(t){r||(H(n.$$.fragment,t),r=!0)},o(t){T(n.$$.fragment,t),r=!1},d(t){N(n,t)}}}function St(t){let e,n,r=(t[0].length>0||t[1].length>0)&&function(t){let e,n,r,i,l,f,m,p,g=t[0],$=[];for(let e=0;e<g.length;e+=1)$[e]=_t(jt(t,g,e));const v=t=>T($[t],1,1,(()=>{$[t]=null}));let x=t[1],k=[];for(let e=0;e<x.length;e+=1)k[e]=Mt(Ct(t,x,e));const w=t=>T(k[t],1,1,(()=>{k[t]=null}));return{c(){e=u("div"),n=u("h2"),n.textContent="Contacts",r=h(),i=u("div");for(let t=0;t<$.length;t+=1)$[t].c();l=h(),f=u("span"),f.textContent="•",m=h();for(let t=0;t<k.length;t+=1)k[t].c();d(n,"class","text-section-heading hidden print:block"),d(f,"class","text-vivid cursor-default print:hidden"),d(i,"class","flex flex-row print:flex-col justify-center print:justify-left space-x-4 print:space-x-0 space-y-0"),d(e,"class","item-spacing")},m(t,c){a(t,e,c),o(e,n),o(e,r),o(e,i);for(let t=0;t<$.length;t+=1)$[t].m(i,null);o(i,l),o(i,f),o(i,m);for(let t=0;t<k.length;t+=1)k[t].m(i,null);p=!0},p(t,e){if(1&e){let n;for(g=t[0],n=0;n<g.length;n+=1){const r=jt(t,g,n);$[n]?($[n].p(r,e),H($[n],1)):($[n]=_t(r),$[n].c(),H($[n],1),$[n].m(i,l))}for(A(),n=g.length;n<$.length;n+=1)v(n);B()}if(2&e){let n;for(x=t[1],n=0;n<x.length;n+=1){const r=Ct(t,x,n);k[n]?(k[n].p(r,e),H(k[n],1)):(k[n]=Mt(r),k[n].c(),H(k[n],1),k[n].m(i,null))}for(A(),n=x.length;n<k.length;n+=1)w(n);B()}},i(t){if(!p){for(let t=0;t<g.length;t+=1)H($[t]);for(let t=0;t<x.length;t+=1)H(k[t]);p=!0}},o(t){$=$.filter(Boolean);for(let t=0;t<$.length;t+=1)T($[t]);k=k.filter(Boolean);for(let t=0;t<k.length;t+=1)T(k[t]);p=!1},d(t){t&&c(e),s($,t),s(k,t)}}}(t);return{c(){r&&r.c(),e=p()},m(t,i){r&&r.m(t,i),a(t,e,i),n=!0},p(t,[e]){(t[0].length>0||t[1].length>0)&&r.p(t,e)},i(t){n||(H(r),n=!0)},o(t){T(r),n=!1},d(t){r&&r.d(t),t&&c(e)}}}function zt(t){return[[{name:"Email",link:"mailto:madhavanraja99@gmail.com",paths:["M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"]},{name:"LinkedIn",link:"https://www.linkedin.com/in/madhavan-raja/",paths:["M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"]},{name:"GitHub",link:"https://github.com/madhavan-raja",paths:["M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"]}],[{name:"Cute Fluffy Kitten",link:"https://linktr.ee/cutefluffykitten",paths:["M7.953 15.066c-.08.163-.08.324-.08.486.08.517.528.897 1.052.89h1.294v4.776c0 .486-.404.89-.89.89H6.577a.898.898 0 0 1-.889-.891v-4.774H.992c-.728 0-1.214-.729-.89-1.377l6.96-12.627a1.065 1.065 0 0 1 1.863 0l2.913 5.585-3.885 7.042zm15.945 0l-6.96-12.627a1.065 1.065 0 0 0-1.862 0l-2.995 5.586 3.885 7.04c.081.164.081.326.081.487-.08.517-.529.897-1.052.89h-1.296v4.776c.005.49.4.887.89.89h2.914a.9.9 0 0 0 .892-.89v-4.775h4.612c.73 0 1.214-.729.89-1.377Z"]}]]}class Lt extends P{constructor(t){super(),F(this,t,zt,St,l,{})}}function Dt(e){let n,r,i,l,s,f,m,p,g,$,v,x,k,w,b;return i=new q({}),f=new Q({}),p=new nt({}),$=new ut({}),x=new vt({}),w=new Lt({}),{c(){n=u("main"),r=u("div"),V(i.$$.fragment),l=h(),s=u("div"),V(f.$$.fragment),m=h(),V(p.$$.fragment),g=h(),V($.$$.fragment),v=h(),V(x.$$.fragment),k=h(),V(w.$$.fragment),d(s,"class","py-10 flex flex-col space-y-12"),d(r,"class","px-8 sm:px-20 md:px-40 lg:px-80")},m(t,e){a(t,n,e),o(n,r),E(i,r,null),o(r,l),o(r,s),E(f,s,null),o(s,m),E(p,s,null),o(s,g),E($,s,null),o(s,v),E(x,s,null),o(s,k),E(w,s,null),b=!0},p:t,i(t){b||(H(i.$$.fragment,t),H(f.$$.fragment,t),H(p.$$.fragment,t),H($.$$.fragment,t),H(x.$$.fragment,t),H(w.$$.fragment,t),b=!0)},o(t){T(i.$$.fragment,t),T(f.$$.fragment,t),T(p.$$.fragment,t),T($.$$.fragment,t),T(x.$$.fragment,t),T(w.$$.fragment,t),b=!1},d(t){t&&c(n),N(i),N(f),N(p),N($),N(x),N(w)}}}function At(t){let e=document.querySelector("html").classList;return"dark"===localStorage.theme||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches?(e.add("dark"),localStorage.theme="dark"):(e.remove("dark"),localStorage.removeItem("theme")),[]}return new class extends P{constructor(t){super(),F(this,t,At,Dt,l,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
