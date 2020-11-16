"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var perfume_js_1 = require("perfume.js");
var analytics_1 = require("analytics");
var google_analytics_1 = require("@analytics/google-analytics");
var perfumejs_1 = require("@analytics/perfumejs");
/**
 * Accept configuration and initilize analytics
 * @param {Object} options
 * @property {string}  options.trackingId - The measurement ID / web property ID. The format is UA-XXXX-Y.
 * @property {string}  options.trackerName - Custom tracker name for google analytics. Use this if you need multiple googleAnalytics scripts loaded.
 * @property {string}  [options.category] - Name of event category.
 * @property {string}  [options.separator="|"] - The charactor used to separate the content of `data-analytics` attribute into tracking variables `category`, `action`, `label` and `value`
 * @property {boolean} [options.trackPerformance=true] - Toggle for tracking performance
 * @property {string}  [options.trackableAttribute="analytics"] - The attribute name following `data-` attached to the trackable elements.
 * @property {string}  [options.trackableEvent="click"] - The event need to be tracked on trackable elements.
 * @property {string}  [options.labelAttribute="href"] - Use this attribute as label if label is not specified in analytics attribute or element's text content when `labelIsNextContent` is true.
 * @property {boolean} [options.labelIsNextContent=true] - Use element's text content as label if it's not specified in analytics attribute.
 * @property {Object}  [options.googleTasks] - An object used to customize how google analytics validates, constructs and sends measurement protocol requests. See {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks Google Analytics Tasks}.
 */
function SpringloadAnalytics(_a) {
    var trackingId = _a.trackingId, _b = _a.trackerName, trackerName = _b === void 0 ? null : _b, _c = _a.googleTasks, googleTasks = _c === void 0 ? {} : _c, overrideOptions = __rest(_a, ["trackingId", "trackerName", "googleTasks"]);
    var DEFAULT_CATEGORY = "/" + document.location.pathname.substr(1);
    var DEFAULT_SEPARATOR = "|";
    var DEFAULT_TRACK_PERFORMANCE = true;
    var DEFAULT_TRACKABLE_ATTRIBUTE = "analytics";
    var DEFAULT_TRACKABLE_EVENT = "click";
    var DEFAULT_LABEL_ATTRIBUTE = "href";
    var DEFAULT_LABEL_IS_NEXT_CONTENT = true;
    var options = __assign({ category: DEFAULT_CATEGORY, separator: DEFAULT_SEPARATOR, trackPerformance: DEFAULT_TRACK_PERFORMANCE, trackableAttribute: DEFAULT_TRACKABLE_ATTRIBUTE, trackableEvent: DEFAULT_TRACKABLE_EVENT, labelAttribute: DEFAULT_LABEL_ATTRIBUTE, labelIsNextContent: DEFAULT_LABEL_IS_NEXT_CONTENT }, overrideOptions);
    var plugins = [
        google_analytics_1["default"](__assign({ trackingId: trackingId, tasks: googleTasks, cookieConfig: {
                cookieName: "gaCookie",
                cookieDomain: document.location.hostname,
                cookieExpires: 60 * 60 * 24 * 28,
                cookieUpdate: "false"
            } }, (trackerName ? { instanceName: trackerName } : null))),
    ];
    // Track performance metrics
    if (options.trackPerformance) {
        plugins.push(perfumejs_1["default"]({
            perfume: perfume_js_1["default"],
            category: "perfMetrics",
            destinations: {
                all: true
            },
            perfumeOptions: {
                resourceTiming: true,
                elementTiming: true,
                maxMeasureTime: 15000
            }
        }));
    }
    var analytics = analytics_1["default"]({
        app: "springload-analytics",
        plugins: plugins
    });
    function trackScreenView(pageData, options) {
        if (!pageData) {
            analytics.page();
        }
        else if (!options) {
            analytics.page(pageData);
        }
        else {
            analytics.page(pageData, options);
        }
    }
    /**
     * Define the trackable elements and set the event handlers on them
     *
     * @param {Object} options
     * @property {string}  [options.separator="|"]
     * @property {string}  [options.trackableAttribute="analytics"]
     * @property {string}  [options.trackableEvent="click"]
     * @property {boolean} [options.labelIsNextContent]
     */
    var setupTrackables = function (_a) {
        var _b = _a === void 0 ? options : _a, separator = _b.separator, trackableAttribute = _b.trackableAttribute, trackableEvent = _b.trackableEvent, labelIsNextContent = _b.labelIsNextContent, labelAttribute = _b.labelAttribute;
        // Only supporting modern browsers for selection
        if (document.querySelectorAll) {
            var elements = document.querySelectorAll("[data-" + trackableAttribute + "]");
            elements.forEach(function (el) {
                // Grab the values from the data attribute
                var params = getElementTrackingData(el, "data-" + trackableAttribute);
                // Set the event tracking variables
                var _a = params.split(separator), category = _a[0], action = _a[1], label = _a[2], value = _a[3];
                label =
                    label !== undefined && label !== ""
                        ? label
                        : labelIsNextContent
                            ? el.textContent
                            : el.getAttribute(labelAttribute);
                on(el, trackableEvent, function () {
                    analytics.track(action, {
                        category: category || options.category,
                        label: label,
                        value: value
                    });
                });
            });
        }
    };
    /**
     * on event handler
     *
     * @param {Node} element
     * @param {string} event
     * @param {function} callback
     */
    var on = function (element, event, callback) {
        if ("addEventListener" in window) {
            element.addEventListener(event, callback, false);
        }
        else if ("attachEvent" in window) {
            element.attachEvent("on" + event, callback);
        }
        else {
            element["on" + event] = callback;
        }
    };
    /**
     * Find the closest parent element with an trackable attribute set on it and return the value of that attribute
     *
     * @param {Node} element
     * @param {string} attribute
     * @returns {string}
     */
    var getElementTrackingData = function (element, attribute) {
        if (element.hasAttribute(attribute) && element.getAttribute(attribute)) {
            return element.getAttribute(attribute);
        }
        return element.parentNode
            ? getElementTrackingData(element.parentNode, attribute)
            : "";
    };
    /**
     * Track an analytics event. This will trigger track calls in google analytics.
     *
     * @param {string} label - Event label
     * @param {string} value - Event value
     * @param {string} [category] - Event category
     * @param {string} [action="click"] - Event action
     * @returns {string}
     */
    var track = function (label, value, category, action) {
        if (category === void 0) { category = options.category; }
        if (action === void 0) { action = options.trackableEvent; }
        analytics.track(action, {
            category: category,
            label: label,
            value: value
        });
    };
    // Setup elements tracking with default options
    setupTrackables();
    return {
        trackScreenView: trackScreenView,
        track: track,
        setupTrackables: setupTrackables
    };
}
exports["default"] = SpringloadAnalytics;
