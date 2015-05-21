/**
 * jquery.easyBanner.js
 * @author    HappyFreeLife
 * @version   1.1.3
 * @url       https://github.com/happyfreelife/easyBanner/
 */

;(function ($, window, document, undefined) {
    $.fn.easyBanner = function(newOpt) {
        var opt = $.extend({
            animation: 'slide',    // 动画模式: ['slide', 'fade']
            trigger  : 'click',    // 触发动画的事件类型: ['click', 'hover']
            direction: 'x',        // 滑动方向: ['x', 'y'](只适用于'slide'动画模式)
            arrowBtn : true,       // 左右箭头按钮
            serialBtn: true,       // 序列按钮
            lazyLoad : false,      // 图片预加载
            auto     : true,       // 自动轮播
            speed    : 800,        // 动画速度
            interval : 5000        // 自动轮播间隔
        }, newOpt || {});

        return this.each(function() {
            var self  = this,
                $this = $(this),
                $list = $this.children(),
                $item = $list.children(),
                len   = $item.length,
                $arrowBtn,
                $serialBtn,
                currentIndex = 0,
                horizonal = opt.direction.toLowerCase() === 'x' ? true : false,
                vertical = opt.direction.toLowerCase() === 'y' ? true : false;

            // 判断浏览器是否支持CSS3动画
            var isSupportCss3Transition = 'transition' in document.documentElement.style;

            // 样式检测器
            $.fn.styleDetecter = function(prop, val) {
                if ($.isArray(val)) {
                    for (var i in val) {
                        if ($(this).css(prop) === val[i]) {
                            return true;
                        }
                    }
                    return false;
                }
                return $(this).css(prop) === val;
            };

            function init() {
                self.hovered = false;

                $list.wrap('<div class="wrap-list">');

                if ($this.styleDetecter('position', 'static')) {
                    $this.css('position', 'relative')
                }

                $('.wrap-list', $this).css({
                    position: 'relative',
                    width   : '100%',
                    height  : '100%',
                    overflow: 'hidden'
                });

                $list.css({
                    position: 'relative',
                    display : 'block',
                    height  : '100%'
                });

                $item.css({
                    display: 'block',
                    width  : $this.width(),
                    height : $this.height()
                });

                if (opt.animation === 'fade') {
                    $('head').append('<style type="text/css">.top-item{z-index: 1;}</style>');
                    $item.css({
                        position: 'absolute',
                        left    : 0,
                        top     : 0
                    });
                    $item.first().show().siblings().hide();
                }

                if (opt.animation === 'slide') {
                    if (isSupportCss3Transition) {
                        $('head').append(
                            '<style type="text/css">' +
                                '.transition-' + opt.speed + '{' +
                                    'transition: all ' + opt.speed + 'ms ease;' +
                                    '-webkit-transition: all ' + opt.speed + 'ms ease;' +
                                '}' +
                            '</style>'
                        );

                        setTimeout(function() {
                            $list.addClass('transition-' + opt.speed);
                        }, 10);
                    }

                    if (horizonal) {
                        $list.css({
                            left: 0,
                            width : (len + 1) * 100 + '%'
                        });

                        $item.css({
                            float : 'left',
                            width : $this.css('width')
                        });
                    }

                    if (vertical) {
                        $list.css({
                            'top': 0,
                            height: 'auto'
                        });
                    }
                }
            }

            // 图片转换为背景图片
            function imgToBackground() {
                $item.each(function() {
                    var $img = $(this).find('img');
                    if (opt.lazyLoad && $img.attr('data-src')) {
                        $(this).attr('background-image', $img.attr('data-src'));
                    } else {
                        var imgUrl = $img.attr('src') || $img.attr('data-src'),
                            bgStr = 'url(' + imgUrl + ') no-repeat center top';
                        $(this).css('background', bgStr);
                    }
                    $img.remove();
                });

                opt.lazyLoad ? imgPreLoader(currentIndex) : '';
            }

            function resizeHandler() {
                $(window).resize(function() {
                    $list.children().css('width', $this.css('width'));
                });
            }

            // 图片预加载器(延迟加载)
            function imgPreLoader(loadingItemIndex) {
                // 只能预加载当前图片之后的1张图片
                if (loadingItemIndex - currentIndex > 1) {
                    return false;
                }

                var img = new Image(),
                    $loadingItem = $item.eq(loadingItemIndex),
                    imgSrc = $loadingItem.attr('background-image'),
                    loadNextImg = function() {
                        $loadingItem.removeClass('loading').removeAttr('background-image');
                        loadingItemIndex ? $loadingItem.css('opacity', 0) : '';
                        $loadingItem.css('background', 'url(' + imgSrc + ') no-repeat center top');
                        loadingItemIndex ? $loadingItem.animate({ opacity: 1 }, opt.speed / 2) : '';

                        // 预加载下一张图片
                        loadingItemIndex++;
                        imgPreLoader(loadingItemIndex);
                    };

                if (imgSrc) {
                    if (!loadingItemIndex) {
                        // 不对第1张图片设置loading.gif的背景图片
                        $loadingItem.css('background', 'url(' + imgSrc + ') no-repeat center top');
                        $loadingItem.removeAttr('background-image')
                    } else {
                        $loadingItem.addClass('loading');
                    }

                    img.src = imgSrc;

                    // 当前图片加载完成之后预加载下一张图片
                    img.complete ? loadNextImg() : img.onload = loadNextImg;
                } else {
                    // 已经加载过当前图片则直接加载下一张
                    loadingItemIndex++;
                    imgPreLoader(loadingItemIndex);
                }
            }

            function addArrowBtn() {
                $this.append('<div class="btn-arrow">');
                var $arrowBtnWrap = $('.btn-arrow', $this);
                $arrowBtnWrap.append(
                    '<a class="prev" style="display: block;float: left;"></a>',
                    '<a class="next" style="display: block;float: right;"></a>'
                );
                $arrowBtn = $('a', $arrowBtnWrap);


                if ($arrowBtnWrap.width() === $this.width()) {
                    $arrowBtnWrap.css('width', '100%')
                }

                // 设置arrowBtnWrap的默认位置
                if ($arrowBtnWrap.styleDetecter('top', 'auto') && $arrowBtnWrap.styleDetecter('bottom', 'auto')) {
                    $arrowBtnWrap.css({
                        top: '50%',
                        'margin-top': -$arrowBtn.height() / 2
                    });
                }

                if ($arrowBtnWrap.styleDetecter('left', 'auto') && $arrowBtnWrap.styleDetecter('right', 'auto')) {
                    $arrowBtnWrap.css({
                        left: '50%',
                        'margin-left': -$arrowBtnWrap.width() / 2
                    });
                }


                if ($arrowBtn.styleDetecter('background-image', 'none')) {
                    $('.prev', $arrowBtnWrap).html('&lt;');
                    $('.next', $arrowBtnWrap).html('&gt;');

                    $arrowBtn.css({
                        font: $this.height() * 0.133 + 'px/' + $arrowBtn.height() + 'px SimHei',
                        color: '#fff',
                        'text-align': 'center'
                    });
                }

                // 阻止连续点击箭头按钮时选中
                $arrowBtn.on('selectstart', function(e) {
                    e.preventDefault();
                });

                $arrowBtnWrap.appendTo($this).css({
                    position :'absolute',
                    height: 0,
                    'z-index': 2
                });

                arrowBtnHandler();
            }

            function addSerialBtn() {
                $this.append('<ol class="btn-serial">');
                var $serialBtnList = $('.btn-serial', $this);
                for (var i = 0; i < len; i++) {
                    $serialBtnList.append('<li>');
                }
                $serialBtn = $('li', $serialBtnList);
                $serialBtn.css('float', 'left');

                // 设置serialBtnList的默认位置
                if ($serialBtnList.styleDetecter('top', 'auto') && $serialBtnList.styleDetecter('bottom', 'auto')) {
                    $serialBtnList.css('bottom', $this.height() / 25);
                }

                if ($serialBtnList.styleDetecter('left', 'auto') && $serialBtnList.styleDetecter('right', 'auto')) {
                    $serialBtnList.css({
                        left: '50%',
                        'margin-left': -$serialBtn.outerWidth(true) * len / 2
                    });
                }

                $serialBtnList.appendTo($this).css({
                    position :'absolute',
                    'z-index': 2
                }).children(':first').addClass('active');

                serailBtnHandler();
            }

            function arrowBtnHandler() {
                $arrowBtn.on('click', function() {
                    if ($list.animated) {
                        return;
                    }
                    $(this).hasClass('prev') ? currentIndex-- : currentIndex++;   
                    play();
                });
            }

            function serailBtnHandler() {
                if (opt.trigger === 'click') {
                    $serialBtn.on('click', function() {
                        if ($list.animated) {
                            return;
                        }
                        currentIndex = $(this).index();
                        play();
                    });
                }

                if (opt.trigger === 'hover') {
                    $serialBtn.on({
                        mouseenter: function() {
                            if ($list.animated) {
                                return;
                            }
                            var $self = $(this);

                            // 防止指针快速地经过序列按钮导致动画序列添加过多
                            timer = setTimeout(function(){
                                currentIndex = $self.index();
                                play();
                            }, 100);
                        },

                        mouseleave: function() {
                            clearTimeout(timer);
                        }
                    });
                }
            }

            function fadeAnimation() {
                $list.animated = true;
                currentIndex = currentIndex === len ?  0 : (currentIndex === -1 ? len - 1 : currentIndex);
                $item.removeClass('top-item').eq(currentIndex)
                     .addClass('top-item')
                     .css({display: 'block', opacity: 0})
                     .animate({opacity: 1}, opt.speed, function() {
                         $list.animated = false;
                     });

                setTimeout(function() {
                    $item.eq(currentIndex).siblings().hide();
                }, opt.speed);
                $serialBtn.eq(currentIndex).addClass('active').siblings().removeClass('active');
                imgPreLoader(currentIndex);
            }

            function slideAnimation() {
                var listWidth  = $item.width()* len,
                    listHeight = $item.height() * len,
                    listLeft   = Math.abs(parseInt($list.css('left'))),
                    listTop    = Math.abs(parseInt($list.css('top')));

                if (listWidth === listLeft || listHeight === listTop || currentIndex < 0 || currentIndex > len) {
                    isSupportCss3Transition ? $list.removeClass('transition-' + opt.speed) : '';
                }

                // mirror item show -> trigger first serialBtn
                if (!currentIndex && (listWidth === listLeft || listHeight === listTop)) {
                    horizonal ? $list.css('left', 0) : $list.css('top', 0);
                }

                // first item -> last item
                if (currentIndex < 0) {
                    horizonal ? $list.css('left', -len * 100 + '%') : $list.css('top', -len * 100 + '%');
                    currentIndex = len - 1;
                }

                // last item -> first item
                if (currentIndex > len) {
                    horizonal ? $list.css('left', 0) : $list.css('top', 0);
                    currentIndex = 1;
                }

                // 动画进行时需要清除定时器，防止实际的自动播放间隔与设置的有误差
                clearInterval(self.autoTimer);

                if (isSupportCss3Transition) {
                    setTimeout(function() {
                        $list.animated = true;
                        isSupportCss3Transition ? $list.addClass('transition-' + opt.speed) : '';
                        horizonal ? $list.css('left', -currentIndex * 100 + '%') : $list.css('top', -currentIndex * 100 + '%');

                        setTimeout(function() {
                            $list.animated = false;
                            opt.auto && !self.hovered ? addAutoTimer() : '';
                        }, opt.speed);
                    }, 10);
                } else {
                    $list.animated = true;
                    if (horizonal) {
                        $list.stop(true, false).animate({ left: -currentIndex * 100 + '%' }, opt.speed, function() {
                            $list.animated = false;
                            opt.auto && !self.hovered ? addAutoTimer() : '';
                        })
                    } else {
                        $list.stop(true, false).animate({ top: -currentIndex * 100 + '%' }, opt.speed, function() {
                            $list.animated = false;
                            opt.auto && !self.hovered ? addAutoTimer() : '';
                        });
                    }
                }

                if (opt.serialBtn) {
                    var activeIndex = currentIndex === len ? 0 : (currentIndex === -1 ? len - 1 : currentIndex);
                    $serialBtn.eq(activeIndex).addClass('active').siblings().removeClass('active');
                }

                imgPreLoader(currentIndex);
            }

            function play() {
                opt.animation === 'fade' ? fadeAnimation() : slideAnimation();
            };

            function auto() {
                addAutoTimer();
                $this.hover(function() {
                    self.hovered = true;
                    clearInterval(self.autoTimer);
                }, function() {
                    self.hovered = false;
                    !$list.animated ? addAutoTimer() : '';
                });
            }

            function addAutoTimer() {
                clearInterval(self.autoTimer);
                self.autoTimer = setInterval(function() {
                    currentIndex++;
                    play();
                }, opt.interval);    
            }

            function run() {
                init();
                imgToBackground();
                resizeHandler();

                if (len <= 1) {
                    return;
                }
                if (opt.animation === 'slide') {
                    $item.first().clone().appendTo($list);
                }
                if (opt.serialBtn) {
                	addSerialBtn();
                }
                if (opt.arrowBtn) {
                    addArrowBtn();
                }
                if (opt.auto) {
                	auto();
                }
            }

            run();
        });
    };
})(jQuery, window, document);
