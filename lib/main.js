var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var Request = require('sdk/request').Request;
var clipboard = require('sdk/clipboard');
var urls = require('sdk/url');
var notifications = require('sdk/notifications');
var contextMenu = require("sdk/context-menu");
var prefs = require("sdk/simple-prefs").prefs;

var button = buttons.ActionButton({
    id: 'eab-so',
    label: 'eab.so',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png',
        '48': './icon-48.png'
    },
    onClick: function(state) {
    	shorten(tabs.activeTab.url)
    }
});

var imgMenuItem = contextMenu.Item({
	label: "Share image with #eatabrick",
	context: contextMenu.SelectorContext("img"),
	contentScript: 'self.on("click", function (node, data) {' +
		           ' self.postMessage(node.src);' +
		           '});',
    onMessage: function (url) {
    	shorten(url);
    }
});

var pageMenuItem = contextMenu.Item({
	label: "Share page with #eatabrick",
	context: contextMenu.PageContext(),
	contentScript: 'self.on("click", function (node, data) {' +
		           ' self.postMessage(document.URL);' +
		           '});',
    onMessage: function (url) {
    	shorten(url);
    }
});

var linkMenuItem = contextMenu.Item({
	label: "Share link with #eatabrick",
	context: contextMenu.SelectorContext("a[href]"),
	contentScript: 'self.on("click", function (node, data) {' +
		           ' self.postMessage(node.href);' +
		           '});',
    onMessage: function (url) {
    	shorten(url);
    }
});

function shorten(url) {
    if (url != 'about:blank' && urls.isValidURI(url)) {
        console.log("Sharing " + url + " as " + prefs.userName);
        var quijote = Request({
            url: 'http://eabso.herokuapp.com/',
            content: {uri: tabs.activeTab.url, user: prefs.userName,},
            onComplete: function (response) {
                if (response.json.error) {
                    notifications.notify({
                        title: 'eab.so',
                        text: response.json.error,
                        iconURL: self.data.url('icon-48.png')
                    });
                }
                else {
                    clipboard.set(response.json.result);
                    notifications.notify({
                        title: 'eab.so',
                        text: response.json.result,
                        iconURL: self.data.url('icon-48.png'),
                        data: response.json.result,
                        onClick: function (data) {
                            tabs.open(data);
                        }
                    });
                }
            }
        }).post();
    }
}