/*!
 * HC Off-canvas Nav
 * ===================
 * Version: 3.1.2
 * Author: Some Web Media
 * Author URL: http://somewebmedia.com
 * Plugin URL: https://github.com/somewebmedia/hc-offcanvas-nav
 * Description: jQuery plugin for creating off-canvas multi-level navigations
 * License: MIT
 */
!function(S,e){"use strict";var a,l,N=e.document,P=(/iPad|iPhone|iPod/.test(navigator.userAgent)||!!navigator.platform&&/iPad|iPhone|iPod/.test(navigator.platform))&&!e.MSStream,A="ontouchstart"in e||navigator.maxTouchPoints||e.DocumentTouch&&N instanceof DocumentTouch,M=function(e){return!isNaN(parseFloat(e))&&isFinite(e)},D=function(e){return e.stopPropagation()},E=function(n,a,l){return function(e){n&&e.preventDefault(),a&&e.stopPropagation(),"function"==typeof l&&l()}},H=(a=S("head"),l="hc-offcanvas-nav-style",function(e){var n=a.find("style#"+l);n.length?n.html(n.html()+e):S('<style id="'+l+'">'+e+"</style>").appendTo(a)}),W=function(e,n,a){var l=a.children("li"),t=l.length,o=-1<n?Math.max(0,Math.min(n-1,t)):Math.max(0,Math.min(t+n+1,t));0===o?a.prepend(e):l.eq(o-1).after(e)},F=0;S.fn.extend({hcOffcanvasNav:function(e){if(!this.length)return this;var l,O=S.extend({},{maxWidth:1024,pushContent:!1,side:"left",levelOpen:"overlap",levelSpacing:40,levelTitles:!1,navTitle:null,navClass:"",disableBody:!0,closeOnClick:!0,customToggle:null,insertClose:!0,insertBack:!0,labelClose:"Close",labelBack:"Back"},e),w=S(N.getElementsByTagName("html")[0]),T=(S(N),S(N.body)),B=(l=function(e){var n=["Webkit","Moz","Ms","O"],a=(N.body||N.documentElement).style,l=e.charAt(0).toUpperCase()+e.slice(1);if(void 0!==a[e])return e;for(var t=0;t<n.length;t++)if(void 0!==a[n[t]+l])return n[t]+l;return!1}("transform"),function(e,n){if(l){var a="left"===O.side?n:-n;e.css(l,"translate3d("+a+"px,0,0)")}else e.css(O.side,n)});return this.each(function(){var e=S(this),n=void 0;if(e.is("ul"))n=e.clone(!0,!0).wrap("<nav>").parent();else if(e.is("nav"))n=e.clone(!0,!0);else if(!(n=e.find("nav, ul").first().clone(!0,!0)).length)return void console.log("%c! HC Offcanvas Nav:%c There is no <nav> or <ul> elements in your menu.","color: red","color: black");var a=n.find("ul");if(a.length){var p="hc-nav-"+ ++F,v={},l=!1,t=0,r=0,o=void 0,i=null,s=void 0,c=void 0;e.addClass("hc-nav "+p),O.customToggle?s=S(O.customToggle).addClass("hc-nav-trigger "+p).on("click",y):(s=S('<a class="hc-nav-trigger '+p+'"><span></span></a>').on("click",y),e.after(s));var d=s.css("display"),f="\n          .hc-offcanvas-nav."+p+" {\n            display: block;\n          }\n          .hc-nav-trigger."+p+" {\n            display: "+(d&&"none"!==d?d:"block")+"\n          }\n          .hc-nav."+p+" {\n            display: none;\n          }\n          ";O.maxWidth&&(f="@media screen and (max-width: "+(O.maxWidth-1)+"px) {\n            "+f+"\n          }"),H(f);var h=n.children("ul").wrapAll('<div class="nav-wrapper nav-wrapper-1">').parent().on("click",D).wrap('<div class="nav-container">').parent();if(O.navTitle&&h.children().prepend("<h2>"+O.navTitle+"</h2>"),n.on("click",D).removeAttr("id").removeClass().addClass("\n            hc-offcanvas-nav\n            "+p+"\n            "+(O.navClass||"")+"\n            nav-levels-"+(O.levelOpen||"none")+"\n            side-"+O.side+"\n            "+(O.disableBody?"disable-body":"")+"\n            "+(P?"is-ios":"")+"\n            "+(A?"touch-device":"")+"\n          ").find("[id]").removeAttr("id"),setTimeout(function(){var e;r=h.width(),e=h.css("transition-duration"),o=parseFloat(e)*(/\ds$/.test(e)?1e3:1),"boolean"!=typeof O.pushContent&&(c=S(O.pushContent)).length&&H(function e(n){return"string"==typeof n?n:n.attr("id")?"#"+n.attr("id"):n.attr("class")?n.prop("tagName").toLowerCase()+"."+n.attr("class").replace(/\s+/g,"."):e(n.parent())+" "+n.prop("tagName").toLowerCase()}(O.pushContent)+" {\n                transition: "+h.css("transition-property").split(",")[0]+" "+h.css("transition-duration")+" "+h.css("transition-timing-function").split(",")[0]+";\n              }")},1),O.disableBody&&n.on("click",b),O.closeOnClick){var u=a.find("li").children("a");!1===O.levelOpen||"none"===O.levelOpen||(u=u.filter(function(){var e=S(this);return!e.siblings().length||e.attr("href")&&"#"!==e.attr("href").charAt(0)})),u.on("click",b)}if(!1!==O.insertClose){var g=S('<li class="nav-close"><a href="#">'+(O.labelClose||"")+"<span></span></a></li>");g.children("a").on("click",E(!0,!0,b)),!0===O.insertClose?a.first().prepend(g):M(O.insertClose)&&W(g,O.insertClose,a.first().add(a.siblings("ul")))}a.each(function(){var e=S(this),n=e.parents("li").length;if(0!==n){var a=e.parent().addClass("nav-parent"),l=a.children("a");v[n]||(v[n]=[]),v[n].push({nav:e});var t=v[n].length-1;v[n][t].wrapper=e.closest(".nav-wrapper");var o=e.wrap('<div class="nav-wrapper nav-wrapper-'+(n+1)+'">').parent().on("click",D);if(!O.levelSpacing||"expand"!==O.levelOpen&&!1!==O.levelOpen&&"none"!==O.levelOpen||e.css("text-indent",O.levelSpacing*n+"px"),!1===O.levelOpen||"none"===O.levelOpen)return;!0===O.levelTitles&&o.prepend("<h2>"+l.text()+"</h2>");var i=S('<span class="nav-next">').appendTo(l),r=S('<label for="'+p+"-"+n+"-"+t+'">'),s=S('<input type="checkbox" id="'+p+"-"+n+"-"+t+'">').attr("data-level",n).attr("data-index",t).on("click",D).on("change",k);if(v[n][t].checkbox=s,a.prepend(s),l.attr("href")&&"#"!==l.attr("href").charAt(0)?i.append(r.on("click",D)):l.on("click",E(!1,!0)).prepend(r),!1!==O.insertBack&&"overlap"===O.levelOpen){var c=S('<li class="nav-back"><a href="#">'+(O.labelBack||"")+"<span></span></a></li>");c.children("a").on("click",E(!0,!0,function(){return x(n,t)})),!0===O.insertBack?e.prepend(c):M(O.insertBack)&&W(c,O.insertBack,e)}}}),T.append(n);var m=function(e,n){if(v[e]&&v[e][n]){var a=v[e][n].checkbox,l=a.parent("li"),t=v[e][n].wrapper;a.prop("checked",!1),t.removeClass("sub-level-open"),l.removeClass("level-open")}}}else console.log("%c! HC Offcanvas Nav:%c Menu must contain <ul> element.","color: red","color: black");function k(){var e,n,a,l,t=S(this),o=Number(t.attr("data-level")),i=Number(t.attr("data-index"));t.prop("checked")?(n=i,a=v[e=o][n].checkbox.parent("li"),(l=v[e][n].wrapper).addClass("sub-level-open"),a.addClass("level-open"),"overlap"===O.levelOpen&&(l.on("click",function(){return x(e,n)}),B(h,e*O.levelSpacing),c&&c.length&&B(c,r+e*O.levelSpacing))):x(o,i)}function C(){l=!0,n.addClass("nav-open"),s.addClass("toggle-open"),"expand"===O.levelOpen&&i&&clearTimeout(i),O.disableBody&&(t=w.scrollTop()||T.scrollTop(),N.documentElement.scrollHeight>N.documentElement.offsetHeight&&w.addClass("hc-nav-yscroll"),T.addClass("hc-nav-open"),t&&T.css("top",-t)),c&&c.length&&B(c,r)}function b(){l=!1,c&&c.length&&B(c,0),n.removeClass("nav-open"),h.removeAttr("style"),s.removeClass("toggle-open"),!1!==O.levelOpen&&"none"!==O.levelOpen&&(i=setTimeout(function(){x(0)},"expand"===O.levelOpen?o:0)),O.disableBody&&(T.removeClass("hc-nav-open"),w.removeClass("hc-nav-yscroll"),t&&(T.css("top","").scrollTop(t),w.scrollTop(t),t=0))}function y(e){e.preventDefault(),e.stopPropagation(),l?b():C()}function x(e,n){for(var a=e;a<=Object.keys(v).length;a++){if(0!==a)if(a==e&&void 0!==n){if(m(a,n),"overlap"===O.levelOpen)v[a][n].wrapper.off("click").on("click",D),B(h,(a-1)*O.levelSpacing),c&&c.length&&B(c,r+(a-1)*O.levelSpacing)}else for(var l in v[a]){if(m(a,l),"overlap"===O.levelOpen)v[a][l].wrapper.off("click").on("click",D),a==e&&(B(h,(a-1)*O.levelSpacing),c&&c.length&&B(c,r+(a-1)*O.levelSpacing))}}}})}})}(jQuery,"undefined"!=typeof window?window:this);