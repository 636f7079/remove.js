// ==UserScript==
// @name         removeSpamElement - [Text]
// @namespace    http://example.com/
// @version      0.11
// @description  nil
// @author       636f7374
// @run-at       document-start
// @include      https://twitter.com/*
// @include      https://www.youtube.com/*
// @grant        none
// ==/UserScript==

var dicts = [
    // Some Keyword..
];
var array = [];
var index = [];
var _time = 0;
var _spam = 0;
var _host = window.location.hostname;
var _def_ = {
    'twitter.com': {
        scanInterval: 300,
        wheelInterval: 2000
    },
    'www.ptt.cc': {
        scanInterval: 300,
        wheelInterval: 90000
    },
    'www.youtube.com': {
        scanInterval: 100,
        wheelInterval: 1000
    }
};
var _scan = {
    'twitter.com': {
        class: [
            {
                name: 'js-stream-item stream-item stream-item',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Generic Tweet'
            },
            {
                name: 'js-stream-item stream-item stream-item js-pinned',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Pin Text'
            },
            {
                name: 'TwitterCardsGrid TwitterCard TwitterCard--animation',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Card Text'
            }
        ]
    },
    'www.ptt.cc': {
        class: [
            {
                name: 'push',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 0,
                comment: 'Comment Text'
            }
        ]
    },
    'www.youtube.com': {
        tag: [
            {
                name: 'ytd-compact-video-renderer',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Recommend Element'
            },
            {
                name: 'ytd-video-renderer',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Search Item Element'
            },
            {
                name: 'ytd-grid-video-renderer',
                iframe: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Tab Recommend Element'
            },
            {
                name: 'ytd-comment-renderer',
                iframes: ['default'],
                lock: true,
                type: 'default',
                offset: 25,
                comment: 'Generic Comment Text'
            },
            {
                name: 'yt-live-chat-text-message-renderer',
                iframes: ['chatframe'],
                lock: false,
                type: 'reverse',
                offset: 25,
                comment: 'Live Chat Message Text'
            }
        ]
    }
};

function offset(counter, remaining, offset) {
    if (counter == 0) return [counter, remaining]
    if (counter < 50) return [0, remaining + counter]
    return [counter - offset, remaining + offset]
}

function getCollection(kind, elementName, iframeName) {
    switch (kind) {
        case 'class':
            if (document.getElementById(iframeName)) {
                return document.getElementById(iframeName).contentWindow.
                    document.getElementsByClassName(elementName);
            } else {
                return document.getElementsByClassName(elementName);
            }
            break;
        case 'tag':
            if (document.getElementById(iframeName)) {
                return document.getElementById(iframeName).contentWindow.
                    document.getElementsByTagName(elementName);
            } else {
                return document.getElementsByTagName(elementName);
            }
            break;
    }
}

function removeSpamElementHandler() {
    for (var kind in _scan) {
        for (var item of _scan[kind]) {
            for (var iframeName in item.iframes) {
                spamElementRemover(kind, item, iframeName);
            }
        }
    }
}

function initIndex(kind, itemName, iframeName) {
    if (!index[kind]) index[kind] = [];
    if (!index[kind][itemName]) index[kind][itemName] = [];
    if (!index[kind][itemName][iframeName]) {
        index[kind][itemName][iframeName] = [];
    }
    if (!index[kind][itemName][iframeName].previous) {
        index[kind][itemName][iframeName].previous = 0;
    }
    if (!index[kind][itemName][iframeName].current) {
        index[kind][itemName][iframeName].current = 0;
    }
    return iframeName;
}

function spamElementRemover(kind, item, iframeName) {
    initIndex(kind, item.name, iframeName);
    var collection = getCollection(kind, item.name, iframeName);
    var ___counter = index[kind][item.name][iframeName];

    if (!item.lock || collection.length != ___counter.previous) {
        ___counter.previous = collection.length
        var remaining = collection.length - ___counter.current;
        if (remaining != 0) {
            [___counter.current, remaining] = offset(___counter.current, remaining, item.offset);
        }
        if (collection[___counter.current] == undefined) {
            ___counter.current = 0;
            ___counter.previous = collection.length;
            remaining = collection.length;
            if (remaining != 0) {
                [___counter.current, remaining] = offset(___counter.current, remaining, item.offset);
            }
        }
        if (item.type == 'reverse') ___counter.current = collection.length - 1;
        while (remaining--) {
            for (var i = 0; i < dicts.length; i++) {
                if (collection[___counter.current].innerText.match(dicts[i])) {
                    _spam++;
                    console.log([collection[___counter.current].innerText, dicts[i]]);
                    console.log('Filter the number of Spam: ' + _spam);
                    collection[___counter.current].remove();
                    if (___counter.current > 0) ___counter.current--;
                    break;
                } else {
                    if (i + 1 == dicts.length) {
                        if (item.type == 'default') ___counter.current++;
                        if (item.type == 'reverse') ___counter.current--;
                        break;
                    }
                }
            }
        }
    }
}

window.addEventListener("wheel", function(e) {
    var delta = Math.sign(e.deltaY);
    if (delta == -1) {
        if (_time == 0) _time = new Date().getTime();
        var interval = _def_.wheelInterval == undefined ? 1000 : _def_.wheelInterval
        if (new Date().getTime() - _time > interval) {
            _time = new Date().getTime();
            index = [];
            removeSpamElementHandler();
            console.log("Wheel Reset");
        }
    }
});

(function() {
    "use strict";
    _scan = _scan[_host] ? _scan[_host] : false;
    _def_ = _def_[_host] ? _def_[_host] : false;
    if (_scan) setInterval(removeSpamElementHandler, Number.isInteger(_def_.scanInterval) ? _def_.scanInterval : 300);
})();