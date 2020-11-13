(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('perfume.js'), require('analytics'), require('@analytics/google-analytics'), require('@analytics/perfumejs')) :
  typeof define === 'function' && define.amd ? define(['perfume.js', 'analytics', '@analytics/google-analytics', '@analytics/perfumejs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SpringloadAnalytics = factory(global.Perfume, global.Analytics, global.googleAnalytics, global.perfumePlugin));
}(this, (function (Perfume, Analytics, googleAnalytics, perfumePlugin) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Perfume__default = /*#__PURE__*/_interopDefaultLegacy(Perfume);
  var Analytics__default = /*#__PURE__*/_interopDefaultLegacy(Analytics);
  var googleAnalytics__default = /*#__PURE__*/_interopDefaultLegacy(googleAnalytics);
  var perfumePlugin__default = /*#__PURE__*/_interopDefaultLegacy(perfumePlugin);

  function SpringloadAnalytics({ trackingId, trackerName, ...overrideOptions }) {
    const DEFAULT_CATEGORY = "/" + document.location.pathname.substr(1);
    const DEFAULT_SEPARATOR = "|";
    const DEFAULT_TRACK_PERFORMANCE = true;
    const DEFAULT_TRACKABLE_ATTRIBUTE = "analytics";
    const DEFAULT_TRACKABLE_EVENT = "click";
    const DEFAULT_LABEL_ATTRIBUTE = "href";
    const DEFAULT_LABEL_IS_NEXT_CONTENT = true;

    const options = {
      category: DEFAULT_CATEGORY,
      separator: DEFAULT_SEPARATOR,
      trackPerformance: DEFAULT_TRACK_PERFORMANCE,
      trackableAttribute: DEFAULT_TRACKABLE_ATTRIBUTE,
      trackableEvent: DEFAULT_TRACKABLE_EVENT,
      labelAttribute: DEFAULT_LABEL_ATTRIBUTE,
      labelIsNextContent: DEFAULT_LABEL_IS_NEXT_CONTENT,
      ...overrideOptions,
    };

    const plugins = [
      googleAnalytics__default['default']({
        trackingId,
        instanceName: trackerName,
        cookieConfig: {
          cookieName: "gaCookie",
          cookieDomain: document.location.hostname,
          cookieExpires: 60 * 60 * 24 * 28,
          cookieUpdate: "false",
        },
      }),
    ];

    // Track performance metrics
    if (options.trackPerformance) {
      plugins.push(
        perfumePlugin__default['default']({
          perfume: Perfume__default['default'],
          category: "perfMetrics",
          destinations: {
            all: true,
          },
          perfumeOptions: {
            resourceTiming: true,
            elementTiming: true,
            maxMeasureTime: 15000,
          },
        })
      );
    }

    const analytics = Analytics__default['default']({
      app: "springload-analytics",
      plugins,
    });

    // Setup elements tracking with default options
    setupTrackables();

    /**
     * Page tracking
     * @param {object} data - override data
     */
    const trackScreenView = (data = {}) => {
      analytics.page(data);
    };

    /**
     * Define the trackable elements and set the event handlers on them
     */
    const setupTrackables = (
      {
        separator,
        trackableAttribute,
        trackableEvent,
        labelIsNextContent,
        labelAttribute,
      } = options
    ) => {
      // Only supporting modern browsers for selection
      if (document.querySelectorAll) {
        const elements = document.querySelectorAll(`[data-${attribute}]`);
        for (const el of elements) {
          // Grab the values from the data attribute
          const params = getElementTrackingData(
            el,
            `data-${trackableAttribute}`
          );

          // Set the event tracking variables
          let [category, action, label, value] = params.split(separator);
          label =
            label !== undefined && label !== ""
              ? label
              : labelIsNextContent
              ? el.textContent
              : el.getAttribute(labelAttribute);

          on(el, trackableEvent, () => {
            analytics.track(action, {
              category: category || options.category,
              label,
              value,
            });
          });
        }
      }
    };

    /**
     * on event handler
     * @param {Node} element
     * @param {string} event
     * @param {function} callback
     */
    const on = (element, event, callback) => {
      if ("addEventListener" in window) {
        element.addEventListener(event, callback, false);
      } else if ("attachEvent" in window) {
        element.attachEvent("on" + event, callback);
      } else {
        element["on" + event] = callback;
      }
    };

    /**
     * Find the closest parent element with an trackable attribute set on it and return the value of that attribute
     * @param {Node} element
     * @param {string} trackableAttribute
     * @returns {string}
     */
    const getElementTrackingData = (element, attribute) => {
      if (el.hasAttribute(attribute) && el.getAttribute(attribute)) {
        return el.getAttribute(attribute);
      }
      return element.parentNode
        ? getElementTrackingData(element.parentNode, attribute)
        : '';
    };

    const track = (
      label, 
      category = options.category, 
      eventName = options.trackableEvent,
      value,
    ) => {
      analytics.track(eventName, {
        category,
        label,
        value
      });
    };

    return {
      trackScreenView,
      track,
      setupTrackables,
    }
  }

  return SpringloadAnalytics;

})));
