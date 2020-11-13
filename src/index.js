import Perfume from "perfume.js";
import Analytics from "analytics";
import googleAnalytics from "@analytics/google-analytics";
import perfumePlugin from "@analytics/perfumejs";

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
    googleAnalytics({
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
      perfumePlugin({
        perfume: Perfume,
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

  const analytics = Analytics({
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

export default SpringloadAnalytics;
