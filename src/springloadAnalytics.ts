import Analytics, { AnalyticsInstance } from 'analytics';

export interface IAnalyticsOptions {
  debug?: boolean;
  separator?: string;
  trackableAttribute?: string;
  trackableEvent?: keyof HTMLElementEventMap;
  trackerPlugins?: Array<any>;
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
  action: string;
  separator?: string;
  payloadKeys: Array<string>;
  trackableAttribute?: string;
  trackableEvent: keyof HTMLElementEventMap;
  sendTo?: Array<string>;
}

const DEFAULT_ACTION = 'click';
const DEFAULT_SEPARATOR = '|';
const DEFAULT_PAYLOAD_KEYS: string[] = [];
const DEFAULT_TRACKABLE_ATTRIBUTE = 'analytics';
const DEFAULT_TRACKABLE_EVENT: keyof HTMLElementEventMap = 'click';
const DEFAULT_ENABLED_PLUGINS = { all: true };

let options: any = {
  action: DEFAULT_ACTION,
  separator: DEFAULT_SEPARATOR,
  payloadKeys: DEFAULT_PAYLOAD_KEYS,
  trackableAttribute: DEFAULT_TRACKABLE_ATTRIBUTE,
  trackableEvent: DEFAULT_TRACKABLE_EVENT,
  plugins: DEFAULT_ENABLED_PLUGINS,
};

let analyInstance: any = null;

function withAnalytics(callback: Function) {
  if (!analyInstance) {
    console.warn(
      `Couldn't apply tracing hooks, make sure you call Sentry.init before initialzing Vue!`
    );
  }
  callback(analyInstance);
}

/**
 * Accept configuration and initilize analytics
 *
 * @param {Object} options
 * @property {string}  [options.category] - Name of event category.
 * @property {string}  [options.separator="|"] - The charactor used to separate the content of `data-analytics` attribute into tracking variables `category`, `action`, `label` and `value`
 * @property {boolean} [options.trackPerformance=true] - Toggle for tracking performance
 * @property {string}  [options.trackableAttribute="analytics"] - The attribute name following `data-` attached to the trackable elements.
 * @property {string}  [options.trackableEvent="click"] - The event need to be tracked on trackable elements.
 * @property {string}  [options.labelAttribute="href"] - Use this attribute as label if label is not specified in analytics attribute or element's text content when `labelIsNextContent` is true.
 * @property {boolean} [options.labelIsNextContent=true] - Use element's text content as label if it's not specified in analytics attribute.
 * @property {array}   [options.trackerPlugins] -  Array of analytics tracker plugins
 */
export const init = ({
  trackerPlugins = [],
  debug = false,
  ...overrideOptions
}: IAnalyticsOptions) => {
  options = { ...options, ...overrideOptions };
  analyInstance = Analytics({
    app: 'springload-analytics',
    plugins: trackerPlugins,
    debug,
  });
};

/**
 * Track an analytics event. This will trigger track calls in google analytics.
 *
 * @param {string} action - Event action
 * @param {object} payload - Event data
 * @param {object} [sendTo] - Tracker list that will accept this event
 */
export const track = (action: string, payload: any, sendTo?: Array<string>) => {
  const plugins = Array.isArray(sendTo)
    ? sendTo.reduce((acc, tracker) => ({ ...acc, [tracker]: true }), {})
    : { all: true };
  withAnalytics((analytics: AnalyticsInstance) => {
    analytics.track(action, payload, { plugins });
  });
};

/**
 * Define the trackable elements and set the event handlers on them
 *
 * @param {Object} options
 * @property {string}  [options.separator="|"]
 * @property {string}  [options.trackableAttribute="analytics"]
 * @property {string}  [options.trackableEvent="click"]
 * @property {boolean} [options.labelIsNextContent]
 * @property {string}  [options.labelAttribute]
 * @property {array}  [options.sendTo]
 */
export const setupTrackables = ({
  action,
  separator,
  payloadKeys,
  trackableAttribute,
  trackableEvent,
  sendTo,
}: ISetupTackablesOptions = options) => {
  // Only supporting modern browsers for selection
  if (document.querySelectorAll) {
    const elements = document.querySelectorAll(`[data-${trackableAttribute}]`);
    elements.forEach((el) => {
      // Grab the values from the data attribute
      const params = getElementTrackingData(el, `data-${trackableAttribute}`);
      const payload = params.split(separator).reduce(
        (acc: any, param = '', index: number) => ({
          [payloadKeys[index]]: JSON.parse(param),
          ...acc,
        }),
        {}
      );

      on(el, trackableEvent, () => {
        track(action, payload, sendTo);
      });
    });
  }
};

/**
 * Page tracking
 *
 * @param {IPageData} [pageData = {}] - Page data overrides.
 * @property {string} [pageData.title] - Page title
 * @property {string} [pageData.url] - Page url
 * @property {string} [pageData.path] - Page path
 * @property {string} [pageData.search] - Page search
 * @property {string} [pageData.width] - Page width
 * @property {string} [pageData.height] - Page height
 * @param {array} [sendTo] - Tracker list that will accept this event
 */
export function page(pageData?: IPageData | Function): void;
export function page(pageData: IPageData, sendTo?: string[]): void {
  const plugins = Array.isArray(sendTo)
    ? sendTo.reduce((acc, tracker) => ({ ...acc, [tracker]: true }), {})
    : { all: true };
  withAnalytics((analytics: AnalyticsInstance) => {
    if (!pageData) {
      analytics.page();
    } else if (!plugins) {
      analytics.page(pageData);
    } else {
      analytics.page(pageData, { plugins });
    }
  });
}

export const identify = ({ userId, ...args }: { userId: string }) => {
  withAnalytics((analytics: AnalyticsInstance) =>
    analytics.identify(userId, ...args)
  );
};

/**
 * Find the closest parent element with an trackable attribute set on it and return the value of that attribute
 *
 * @param {Node} element
 * @param {string} attribute
 * @returns {string}
 */
const getElementTrackingData = (element: Element, attribute: string): string | null => {
  if (element.hasAttribute(attribute) && element.getAttribute(attribute)) {
    return element.getAttribute(attribute);
  }
  return element.parentNode
    ? getElementTrackingData(element.parentNode as Element, attribute)
    : '';
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
  if ('addEventListener' in window) {
    element.addEventListener(event, callback, false);
  } else if ('attachEvent' in window) {
    (<any>element).attachEvent('on' + event, callback);
  } else {
    (element as any)['on' + event] = callback;
  }
};
