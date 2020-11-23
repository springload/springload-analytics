import { getItem, removeItem, setItem } from '@analytics/storage-utils';
import { v4 as uuidv4 } from 'uuid';

interface ITecPluginConfig {
  trackerUrl: string;
  applicationVersion: string;
}

function isTimeout(createdAt: string, validity: number) {
  const expiryDate = Number(createdAt) + validity * 1000;
  return new Date().getTime() > expiryDate;
};

function clearStorage() {
  removeItem('sessionId');
  removeItem('createdAt');
  removeItem('sessions');
};

function createNewIdentity() {
  const uuid = uuidv4();
  
  setItem('sessions', '1');
  setItem('createdAt', new Date().getTime().toString());
  setItem('sessionId', uuid);
};

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
      const sessionId = getItem('sessionId');
      const createdAt = getItem('createdAt');
      let sessions = Number(getItem('sessions'));

      // Session times increment
      if (!getItem('existingSession', 'sessionStorage')) {
        // New session
        setItem('sessions', (++sessions).toString());
        setItem('existingSession', 'true', 'sessionStorage');
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
