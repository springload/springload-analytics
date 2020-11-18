interface ITecPluginConfig {
  trackerUrl: string;
  applicationVersion: string;
}

function isTimeout(createdAt: string, validity: number) {
  const expiryDate = Number(createdAt) + validity * 1000;
  return new Date().getTime() > expiryDate;
};

function clearStorage() {
  window.localStorage.removeItem('sessionId');
  window.localStorage.removeItem('createdAt');
  window.localStorage.removeItem('sessions');
};

function createNewIdentity() {
  const arr = new Uint8Array(10);
  window.crypto.getRandomValues(arr);

  window.localStorage.setItem('sessions', '1');
  window.localStorage.setItem('createdAt', new Date().getTime().toString());
  window.localStorage.setItem('sessionId', Array.from(arr, dec2hex).join(''));
};

// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
function dec2hex(dec) {
  return dec < 10
    ? '0' + String(dec)
    : dec.toString(16)
}

function tecPlugin(pluginConfig: ITecPluginConfig) {
  return {
    name: 'tec',
    config: pluginConfig,
    initialize: ({ instance, config }) => {},
    track: ({ payload, config }) => {
      const { trackerUrl, applicationVersion, customPayloadKey } = config;
      const { properties, event } = payload;
      const { label: eventLabel } = properties;
      const eventData = properties[customPayloadKey || 'value'];
      const trackInfo = {
        sessionId: window.sessionStorage.getItem('sessionId'),
        applicationVersion,
        timestamp: new Date().toISOString(),
        url: window.location.pathname + window.location.search,
        eventName: event,
        eventLabel,
        eventData,
      };
      fetch(trackerUrl, {
        method: 'POST',
        body: JSON.stringify(trackInfo),
      });
    },
    identify: () => {
      const sessionId = window.localStorage.getItem('sessionId');
      const createdAt = window.localStorage.getItem('createdAt');
      let sessions = Number(window.localStorage.getItem('sessions'));

      // Session times increment
      if (!window.sessionStorage.getItem('existingSession')) {
        // New session
        window.localStorage.setItem('sessions', (++sessions).toString());
        window.sessionStorage.setItem('existingSession', 'true');
      }

      if (sessionId && createdAt) {
        if (isTimeout(createdAt, 7 * 24 * 60 * 60) || sessions > 20) {
          clearStorage();
          createNewIdentity();
        }
      } else {
        clearStorage();
        createNewIdentity();
      }
    },
  };
}

export default tecPlugin;
