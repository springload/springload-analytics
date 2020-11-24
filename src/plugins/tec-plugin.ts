import { getItem, removeItem, setItem } from '@analytics/storage-utils';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

interface ITecPluginConfig {
  trackerUrl: string;
  applicationVersion: string;
}

function isTimeout(validity: number) {
  const uuid_arr = getItem('userId').split( '-' );
  const time_str = [
      uuid_arr[ 2 ].substring( 1 ),
      uuid_arr[ 1 ],
      uuid_arr[ 0 ]
  ].join( '' );

  const expiryDate = parseInt(time_str, 16) + validity * 1000;
  return new Date().getTime() > expiryDate;
};

function clearStorage() {
  removeItem('userId');
  removeItem('sessions');
};

function createNewIdentity() {
  const uuid = uuidv1({
    msecs: new Date().getTime(),
  });
  
  setItem('sessions', '1');
  setItem('userId', uuid);
};

function tecPlugin(pluginConfig: ITecPluginConfig) {
  return {
    name: 'tec',
    config: pluginConfig,
    initialize: ({ instance, config }) => {},
    track: ({ payload, config }) => {
      this.identify();
      const { trackerUrl, applicationVersion, customPayloadKey } = config;
      const { properties, event } = payload;
      const { label: eventLabel } = properties;
      const eventData = properties[customPayloadKey || 'data'];
      const trackInfo = {
        userId: getItem('userId'),
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
      const userId = getItem('userId');
      let sessions = Number(getItem('sessions'));

      // Session times increment
      if (!getItem('sessionId', 'sessionStorage')) {
        // New session
        setItem('sessions', (++sessions).toString());
        setItem('sessionId', uuidv4(), 'sessionStorage');
      }

      if (userId) {
        if (isTimeout(7 * 24 * 60 * 60) || sessions > 20) {
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
