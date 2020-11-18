interface ITecPluginConfig {
  trackerUrl: string;
  applicationVersion: string;
}

function tecPlugin(pluginConfig: ITecPluginConfig) {
  return {
    name: "tec",
    config: pluginConfig,
    initialize: ({ instance, config }) => {},
    track: ({ payload, config }) => {
      const { trackerUrl, applicationVersion, customPayloadKey } = config;
      const { properties, event } = payload;
      const { label: eventLabel } = properties;
      const eventData = properties[customPayloadKey || 'value'];
      const trackInfo = {
        sessionId: window.sessionStorage.getItem("sessionId"),
        applicationVersion,
        timestamp: new Date().toISOString(),
        url: window.location.pathname + window.location.search,
        eventName: event,
        eventLabel,
        eventData,
      };
      fetch(trackerUrl, {
        method: "POST",
        body: JSON.stringify(trackInfo),
      });
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
      window.sessionStorage.setItem("sessionId", payload.sessionId);
    },
  };
}

export default tecPlugin;
