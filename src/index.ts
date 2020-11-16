import Perfume from "perfume.js";
import Analytics from "analytics";
import googleAnalytics from "@analytics/google-analytics";
import perfumePlugin from "@analytics/perfumejs";

export type ValuesOf<T extends any[]> = T[number];

// See https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks
type GoogleTasks =
  | "customTask"
  | "previewTask"
  | "checkProtocolTask"
  | "validationTask"
  | "checkStorageTask"
  | "historyImportTask"
  | "samplerTask"
  | "buildHitTask"
  | "sendHitTask"
  | "timingTask"
  | "displayFeaturesTask";

interface IAnalyticsOptions {
  trackingId: string;
  trackerName?: string;
  category?: string;
  separator?: string;
  trackPerformance?: boolean;
  trackableAttribute?: string;
  trackableEvent?: keyof HTMLElementEventMap;
  labelAttribute?: string;
  labelIsNextContent?: boolean;
  googleTasks?: Record<GoogleTasks, Function | null> | {};
}

interface IPageData {
  title?: string;
  url?: string;
  path?: string;
  search?: string;
  width?: string;
  height?: string;
}

interface ISetupTackablesOptions {
  separator?: string;
  trackableAttribute?: string;
  trackableEvent?: keyof HTMLElementEventMap;
  labelIsNextContent?: boolean;
  labelAttribute?: string;
}

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
function SpringloadAnalytics({
  trackingId,
  trackerName = null,
  googleTasks = {},
  ...overrideOptions
}: IAnalyticsOptions) {
  const DEFAULT_CATEGORY = "/" + document.location.pathname.substr(1);
  const DEFAULT_SEPARATOR = "|";
  const DEFAULT_TRACK_PERFORMANCE = true;
  const DEFAULT_TRACKABLE_ATTRIBUTE = "analytics";
  const DEFAULT_TRACKABLE_EVENT: keyof HTMLElementEventMap = "click";
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
      tasks: googleTasks,
      cookieConfig: {
        cookieName: "gaCookie",
        cookieDomain: document.location.hostname,
        cookieExpires: 60 * 60 * 24 * 28,
        cookieUpdate: "false",
      },
      ...(trackerName ? { instanceName: trackerName } : null),
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

  /**
   * Page tracking
   * 
   * @param {IPageData} [pageData = {}] - Page data overrides.
   * @property {string} [data.title] - Page title
   * @property {string} [data.url] - Page url
   * @property {string} [data.path] - Page path
   * @property {string} [data.search] - Page search
   * @property {string} [data.width] - Page width
   * @property {string} [data.height] - Page height
   * @param {Object} [options] - Page tracking options
   */
  function trackScreenView(pageData?: IPageData | Function): void;
  function trackScreenView(pageData: IPageData, options?): void {
    if (!pageData) {
      analytics.page()
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
  const setupTrackables = ({
    separator,
    trackableAttribute,
    trackableEvent,
    labelIsNextContent,
    labelAttribute,
  }: ISetupTackablesOptions = options) => {
    // Only supporting modern browsers for selection
    if (document.querySelectorAll) {
      const elements = document.querySelectorAll(
        `[data-${trackableAttribute}]`
      );
      elements.forEach(el => {
        // Grab the values from the data attribute
        const params = getElementTrackingData(el, `data-${trackableAttribute}`);

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
  const on = (
    element: Element,
    event: keyof HTMLElementEventMap,
    callback: EventListenerOrEventListenerObject
  ) => {
    if ("addEventListener" in window) {
      element.addEventListener(event, callback, false);
    } else if ("attachEvent" in window) {
      (<any>element).attachEvent("on" + event, callback);
    } else {
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
  const getElementTrackingData = (element, attribute) => {
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
  const track = (
    label,
    value,
    category = options.category,
    action = options.trackableEvent,
  ) => {
    analytics.track(action, {
      category,
      label,
      value,
    });
  };

  // Setup elements tracking with default options
  setupTrackables();

  return {
    trackScreenView,
    track,
    setupTrackables,
  };
}

export default SpringloadAnalytics;
