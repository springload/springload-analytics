import googleAnalytics from "@analytics/google-analytics";

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

interface IGoogleAnalyticsOptions {
  trackingId: string;
  trackerName?: string;
  tasks?: Record<GoogleTasks, Function | null> | {};
}

/**
 * Create google analytics plugin
 *
 * @param {Object} options
 * @property {string} options.trackingId - The measurement ID / web property ID. The format is UA-XXXX-Y.
 * @property {string} options.trackerName - Custom tracker name for google analytics. Use this if you need multiple googleAnalytics scripts loaded.
 * @property {Object}  [options.tasks] - An object used to customize how google analytics validates, constructs and sends measurement protocol requests. See {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks Google Analytics Tasks}.
 */
const googleAnalyticsPlugin = ({
  trackingId,
  trackerName,
  tasks = [],
}: IGoogleAnalyticsOptions) => {
  return googleAnalytics({
    trackingId,
    tasks,
    cookieConfig: {
      cookieName: "gaCookie",
      cookieDomain: document.location.hostname,
      cookieExpires: 60 * 60 * 24 * 28,
      cookieUpdate: "false",
    },
    ...(trackerName ? { instanceName: trackerName } : null),
  });
};

export default googleAnalyticsPlugin;
