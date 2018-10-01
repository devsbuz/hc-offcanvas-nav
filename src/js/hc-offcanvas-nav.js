/*!
 * HC Off-canvas Nav
 * ===================
 * Version: 3.1.4
 * Author: Some Web Media
 * Author URL: http://somewebmedia.com
 * Plugin URL: https://github.com/somewebmedia/hc-offcanvas-nav
 * Description: jQuery plugin for creating off-canvas multi-level navigations
 * License: MIT
 */

(function($, window) {
  'use strict';

  const document = window.document;
  const $html = $(document.getElementsByTagName('html')[0]);
  const $document = $(document);

  const hasScrollBar = () => {
    return document.documentElement.scrollHeight > document.documentElement.offsetHeight;
  };

  const isIos = (() => {
    return ((/iPad|iPhone|iPod/.test(navigator.userAgent)) || (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))) && !window.MSStream;
  })();

  const isTouchDevice = (() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints || (window.DocumentTouch && document instanceof DocumentTouch);
  })();

  const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  const toMs = (s) => {
    return parseFloat(s) * (/\ds$/.test(s) ? 1000 : 1);
  };

  const ID = function() {
    return Math.random().toString(36).substr(2) + '-' + Math.random().toString(36).substr(2);
  };

  const stopPropagation = (e) => e.stopPropagation();

  const preventClick = (preventDefault, stopPropagation, cb) => {
    return (e) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      if (typeof cb === 'function') cb();
    };
  };

  const browserPrefix = (prop) => {
    const prefixes = ['Webkit', 'Moz', 'Ms', 'O'];
    const thisBody = document.body || document.documentElement;
    const thisStyle = thisBody.style;
    const Prop = prop.charAt(0).toUpperCase() + prop.slice(1);

    if (typeof thisStyle[prop] !== 'undefined') {
      return prop;
    }

    for (let i = 0; i < prefixes.length; i++) {
      if (typeof thisStyle[prefixes[i] + Prop] !== 'undefined') {
        return prefixes[i] + Prop;
      }
    }

    return false;
  };

  const getElementCssTag = (el) => {
    return typeof el === 'string'
      ? el
      : el.attr('id')
        ? '#' + el.attr('id')
        : el.attr('class')
          ? el.prop('tagName').toLowerCase() + '.' + el.attr('class').replace(/\s+/g, '.')
          : getElementCssTag(el.parent()) + ' ' + el.prop('tagName').toLowerCase();
  };

  const printStyle = (() => {
    const $head = $('head');
    const id = 'hc-offcanvas-nav-style';

    return (css) => {
      const $style = $head.find(`style#${id}`);

      if ($style.length) {
        $style.html($style.html() + css);
      }
      else {
        $(`<style id="${id}">${css}</style>`).appendTo($head);
      }
    };
  })();

  const insertAt = ($insert, n, $parent) => {
    const $children = $parent.children();
    const count = $children.length;
    const i = n > -1
      ? Math.max(0, Math.min(n - 1, count))
      : Math.max(0, Math.min(count + n + 1, count));

    if (i === 0) {
      $parent.prepend($insert);
    } else {
      $children.eq(i - 1).after($insert);
    }
  };

  const setTransform = (() => {
    const transform = browserPrefix('transform');

    return ($el, val, side) => {
      if (transform) {
        const x = side === 'left' ? val : -val;
        $el.css(transform, `translate3d(${x}px,0,0)`);
      }
      else {
        $el.css(side, val);
      }
    };
  })();

  let navCount = 0;

  $.fn.extend({
    hcOffcanvasNav: function(options) {
      if (!this.length) return this;

      const self = this;

      // get body of the current document
      const $body = $(document.body);

      const defaults = {
        maxWidth:         1024,
        pushContent:      false,
        side:             'left',

        levelOpen:        'overlap', // overlap / expand / none
        levelSpacing:     40,
        levelTitles:      false,

        navTitle:         null,
        navClass:         '',
        disableBody:      true,
        closeOnClick:     true,
        customToggle:     null,

        insertClose:      true,
        insertBack:       true,
        labelClose:       'Close',
        labelBack:        'Back'
      };

      let Settings = $.extend({}, defaults, options);

      const Plugin = function() {
        const $this = $(this);

        if (!$this.find('ul').addBack('ul').length) {
          console.log('%c! HC Offcanvas Nav:' + `%c Menu must contain <ul> element.`, 'color: red', 'color: black');
          return;
        }

        // count our nav
        navCount++;

        const navUniqId = `hc-nav-${navCount}`;

        let _open = false;
        let _top = 0;
        let _containerWidth = 0;
        let _transitionDuration;
        let _closeLevelsTimeout = null;

        let $toggle;
        let $nav_content;

        // add classes to original menu so we know it's connected to our copy
        $this.addClass(`hc-nav ${navUniqId}`);

        // toggle
        if (!Settings.customToggle) {
          $toggle = $(`<a class="hc-nav-trigger ${navUniqId}"><span></span></a>`).on('click', toggleNav);
          $this.after($toggle);
        }
        else {
          $toggle = $(Settings.customToggle).addClass(`hc-nav-trigger ${navUniqId}`).on('click', toggleNav);
        }

        const toggleDisplay = $toggle.css('display');

        // insert styles
        let css = `
          .hc-offcanvas-nav.${navUniqId} {
            display: block;
          }
          .hc-nav-trigger.${navUniqId} {
            display: ${toggleDisplay && toggleDisplay !== 'none' ? toggleDisplay : 'block'}
          }
          .hc-nav.${navUniqId} {
            display: none;
          }
        `;

        if (Settings.maxWidth) {
          css = `@media screen and (max-width: ${Settings.maxWidth - 1}px) {
            ${css}
          }`;
        }

        printStyle(css);

        // this is our nav
        const $nav = $('<nav>')
          .on('click', stopPropagation) // prevent menu close on self click
          .addClass(`
            hc-offcanvas-nav
            ${navUniqId}
            ${Settings.navClass || ''}
            nav-levels-${Settings.levelOpen || 'none'}
            side-${Settings.side}
            ${Settings.disableBody ? 'disable-body' : ''}
            ${isIos ? 'is-ios' : ''}
            ${isTouchDevice ? 'touch-device' : ''}
          `);

        const $nav_container = $('<div class="nav-container">').appendTo($nav);

        let Model = {};
        let _indexes = {}; // object with level indexes
        const _openLevels = []; // array with current open levels

        // create nav model

        const createModel = () => {
          // get first level menus
          const $first_level = () => {
            const $ul = $this.find('ul').addBack('ul'); // original nav menus
            return $ul.first().add($ul.first().siblings('ul'));
          };

          // reset indexes
          _indexes = {};

          // call
          Model = getModel($first_level());

          function getModel($menu) {
            const level = [];

            $menu.each(function() {
              const $ul = $(this);

              const nav = {
                $ul: $ul,
                items: []
              };

              $ul.children('li').each(function() {
                const $li = $(this);
                const $content = $li.children(':not(ul):not(div)');
                const $nested_navs = $li.find('ul');
                const $subnav = $nested_navs.first().add($nested_navs.first().siblings('ul'));

                // save unique identifier for remembering open menus
                if ($subnav.length && !$li.data('hc-uniqid')) {
                  $li.data('hc-uniqid', ID());
                }

                // add elements to this level
                nav.items.push({
                  $li: $li,
                  $content: $content.clone(true, true),
                  subnav: $subnav.length ? getModel($subnav) : []
                });
              });

              level.push(nav);
            });

            return level;
          }
        };

        // init our Model
        createModel();

        // create nav DOM function
        const createNavDom = () => {
          // empty the container first in case of update
          $nav_container.empty();

          // call
          createDom(Model, $nav_container, 0, Settings.navTitle);

          function createDom(menu, $container, level, title, backIndex) {
            const $wrapper = $(`<div class="nav-wrapper nav-wrapper-${level}">`).appendTo($container).on('click', stopPropagation);
            const $content = $('<div class="nav-content">').appendTo($wrapper);

            // titles
            if (title) {
              $content.prepend(`<h2>${title}</h2>`);
            }

            $.each(menu, (i_nav, nav) => {
              const $menu = nav.$ul.clone(true, true).empty().appendTo($content);

              $.each(nav.items, (i_item, item) => {

                const $item_content = item.$content;
                const $a = $item_content.find('a').addBack('a').on('click', stopPropagation);
                const $item = item.$li.clone(true, true).empty().append($item_content);

                $menu.append($item);

                // indent levels in expanded levels
                if (Settings.levelSpacing && (Settings.levelOpen === 'expand' || (Settings.levelOpen === false || Settings.levelOpen === 'none'))) {
                  const indent = Settings.levelSpacing * level;

                  if (indent) {
                    $menu.css('text-indent', `${indent}px`);
                  }
                }

                // close nav on item click
                if (Settings.closeOnClick) {
                  if (Settings.levelOpen === false || Settings.levelOpen === 'none') {
                    // every item should close the nav
                    $a.on('click', closeNav);
                  }
                  else {
                    // only items without submenus,
                    // or with submenus but with valid hrefs
                    $a.filter(function() {
                      const $this = $(this);
                      return !item.subnav.length || ($this.attr('href') && $this.attr('href').charAt(0) !== '#');
                    }).on('click', closeNav);
                  }
                }

                // do subnav
                if (item.subnav.length) {
                  const nextLevel = level + 1;
                  const uniqid = $item.data('hc-uniqid');
                  let nav_title = '';

                  // create new level
                  if (!_indexes[nextLevel]) {
                    _indexes[nextLevel] = [0];
                  }

                  // li parent class
                  $item.addClass('nav-parent');

                  if (Settings.levelOpen !== false && Settings.levelOpen !== 'none') {
                    const $next_span = $('<span class="nav-next">').appendTo($item_content);
                    const $next_label = $(`<label for="${navUniqId}-${nextLevel}-${_indexes[nextLevel]}">`).on('click', stopPropagation);
                    const $checkbox = $(`<input type="checkbox" id="${navUniqId}-${nextLevel}-${_indexes[nextLevel]}">`)
                      .attr('data-level', nextLevel)
                      .attr('data-index', _indexes[nextLevel])
                      .val(uniqid)
                      .on('click', stopPropagation)
                      .on('change', checkboxChange);

                    // updated, we should keep this level open
                    if (_openLevels.indexOf(uniqid) !== -1) {
                      $wrapper.addClass('sub-level-open');
                      $item.addClass('level-open');
                      $checkbox.prop('checked', true);
                    }

                    $item.prepend($checkbox);

                    // subnav title
                    nav_title = Settings.levelTitles === true ? $($item_content).text().trim() : '';

                    if (!$a.attr('href') || $a.attr('href').charAt(0) === '#') {
                      $a.prepend($next_label.on('click', function() {
                        // trigger parent click in case it has custom click events
                        $(this).parent().trigger('click');
                      }));
                    }
                    else {
                      $next_span.append($next_label);
                    }
                  }

                  _indexes[nextLevel]++;

                  createDom(item.subnav, $item, nextLevel, nav_title, _indexes[nextLevel]-1);
                }
              });
            });

            // insert back links
            if (level && typeof backIndex !== 'undefined') {
              if (Settings.insertBack !== false && Settings.levelOpen === 'overlap') {
                const $children_menus = $content.children('ul');
                let $back = $(`<li class="nav-back"><a href="#">${Settings.labelBack || ''}<span></span></a></li>`);

                $back.children('a').on('click', preventClick(true, true, () => closeLevel(level, backIndex)));

                if (Settings.insertBack === true) {
                  $children_menus.first().prepend($back);
                }
                else if (isNumeric(Settings.insertBack)) {
                  insertAt($back, Settings.insertBack, $children_menus);
                }
              }
            }

            // insert close link
            if (level === 0 && Settings.insertClose !== false) {
              const $nav_ul = $content.children('ul');
              const $close = $(`<li class="nav-close"><a href="#">${Settings.labelClose || ''}<span></span></a></li>`);

              $close.children('a').on('click', preventClick(true, true, closeNav));

              if (Settings.insertClose === true) {
                $nav_ul.first().prepend($close);
              }
              else if (isNumeric(Settings.insertClose)) {
                insertAt($close, Settings.insertClose, $nav_ul.first().add($nav_ul.first().siblings('ul')));
              }
            }
          }
        };

        // create view from model
        createNavDom($nav_container);

        // get some computed data
        setTimeout(() => {
          _containerWidth = $nav_container.width();
          _transitionDuration = toMs($nav_container.css('transition-duration'));

          if (typeof Settings.pushContent !== 'boolean') {
            $nav_content = $(Settings.pushContent);

            if ($nav_content.length) {
              printStyle(`${getElementCssTag(Settings.pushContent)} {
                transition: ${$nav_container.css('transition-property').split(',')[0]} ${$nav_container.css('transition-duration')} ${$nav_container.css('transition-timing-function').split(',')[0]};
              }`);
            }
          }
        }, 1);

        // close menu on body click (nav::after)
        if (Settings.disableBody) {
          $nav.on('click', closeNav);
        }

        // insert nav to DOM
        $body.append($nav);

        // Private methods

        function checkboxChange() {
          const $checkbox = $(this);
          const l = Number($checkbox.attr('data-level'));
          const i = Number($checkbox.attr('data-index'));

          if ($checkbox.prop('checked')) {
            openLevel(l, i);
          }
          else {
            closeLevel(l, i);
          }
        }

        function openNav() {
          _open = true;

          $nav.addClass('nav-open');
          $toggle.addClass('toggle-open');

          if (Settings.levelOpen === 'expand' && _closeLevelsTimeout) {
            clearTimeout(_closeLevelsTimeout);
          }

          if (Settings.disableBody) {
            _top = $html.scrollTop() || $body.scrollTop(); // remember scroll position

            if (hasScrollBar()) {
              $html.addClass('hc-nav-yscroll');
            }

            $body.addClass('hc-nav-open');

            if (_top) {
              $body.css('top', -_top);
            }
          }

          if ($nav_content && $nav_content.length) {
            setTransform($nav_content, _containerWidth, Settings.side);
          }
        }

        function closeNav() {
          _open = false;

          if ($nav_content && $nav_content.length) {
            setTransform($nav_content, 0, Settings.side);
          }

          $nav.removeClass('nav-open');
          $nav_container.removeAttr('style');
          $toggle.removeClass('toggle-open');

          if (Settings.levelOpen !== false && Settings.levelOpen !== 'none') {
            _closeLevelsTimeout = setTimeout(() => {
              closeLevel(0);
            }, Settings.levelOpen === 'expand' ? _transitionDuration : 0);
          }

          if (Settings.disableBody) {
            $body.removeClass('hc-nav-open');
            $html.removeClass('hc-nav-yscroll');

            if (_top) {
              $body.css('top', '').scrollTop(_top);
              $html.scrollTop(_top);

              _top = 0; // reset top
            }
          }

          // trigger close event
          setTimeout(() => {
            // send copy of the setting object
            self.trigger('close', $.extend({}, Settings));
          }, _transitionDuration + 1);
        }

        function toggleNav(e) {
          e.preventDefault();
          e.stopPropagation();

          if (_open) closeNav();
          else openNav();
        }

        function openLevel(l, i) {
          const $checkbox = $(`#${navUniqId}-${l}-${i}`);
          const $li = $checkbox.parent('li');
          const $wrap = $li.closest('.nav-wrapper');

          $wrap.addClass('sub-level-open');
          $li.addClass('level-open');

          // remember what is open
          const uniqid = $li.data('hc-uniqid');
          if (_openLevels.indexOf(uniqid) === -1) {
            _openLevels.push(uniqid);
          }

          if (Settings.levelOpen === 'overlap') {
            $wrap.on('click', () => closeLevel(l, i))
            setTransform($nav_container, l * Settings.levelSpacing, Settings.side);

            if ($nav_content && $nav_content.length) {
              setTransform($nav_content, _containerWidth + l * Settings.levelSpacing, Settings.side);
            }
          }
        }

        const _closeLevel = (l, i, transform) => {
          const $checkbox = $(`#${navUniqId}-${l}-${i}`);
          const $li = $checkbox.parent('li');
          const $wrap = $li.closest('.nav-wrapper');

          $checkbox.prop('checked', false);
          $wrap.removeClass('sub-level-open');
          $li.removeClass('level-open');

          // this is not open anymore
          const uniqid = $li.data('hc-uniqid');
          if (_openLevels.indexOf(uniqid) !== -1) {
            _openLevels.splice(_openLevels.indexOf(uniqid), 1);
          }

          if (transform && Settings.levelOpen === 'overlap') {
            $wrap.off('click').on('click', stopPropagation);
            setTransform($nav_container, (l - 1) * Settings.levelSpacing, Settings.side);

            if ($nav_content && $nav_content.length) {
              setTransform($nav_content, _containerWidth + (l - 1) * Settings.levelSpacing, Settings.side);
            }
          }
        };

        function closeLevel(l, i) {
          for (let level = l; level <= Object.keys(_indexes).length; level++) {
            if (level == l && typeof i !== 'undefined') {
              _closeLevel(l, i, true);
            }
            else {
              // also close all sub sub levels
              for (let index = 0; index < _indexes[level]; index++) {
                _closeLevel(level, index, level == l);
              }
            }
          }
        }

        // Public methods

        self.update = (options, updateDom) => {
          if (typeof options === 'object') {
            Settings = $.extend({}, Settings, options);
          }

          if (typeof options === 'boolean' || updateDom) {
            createModel();
            createNavDom();
          }
        };
      };

      return this.each(Plugin);
    }
  });
})(jQuery, typeof window !== 'undefined' ? window : this);