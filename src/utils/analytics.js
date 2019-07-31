import mixpanel from 'mixpanel-browser';
import ReactGA from 'react-ga';

const env = process.env.DEPLOY_ENV === 'production' ? 'prod' : 'test';
const config = {
  test: {
    userSnap: {
      token: 'def2ae23-a9a8-4f11-85e6-5346cb86d4f2',
      config: {
        fields: {
          email: null
        }
      }
    },
    mixpanel: {
      token: '4ff3f85397ffc3c6b6f0d4120a4ea40a',
      config: { debug: true, ip: false }
    },
    gaTrackingId: 'UA-128164213-2'
  },
  prod: {
    mixpanel: {
      token: 'a030d8845e34bfdc11be3d9f3054ad67',
      config: { ip: false }
    },
    gaTrackingId: 'UA-128164213-1',
    userSnap: {
      token: 'def2ae23-a9a8-4f11-85e6-5346cb86d4f2',
      config: {
        fields: {
          email: null
        }
      }
    }
  }
}[env];

export const mixpanelInit = () => {
  console.debug(
    `[Mixpanel] Tracking initialized for ${env} env using ${
      config.mixpanel.token
    }`
  );
  mixpanel.init(config.mixpanel.token, config.mixpanel.config);
  mixpanel.track('Pageview', { product: 'scd-cdp-portal' });
};

export const mixpanelIdentify = (id, props = null) => {
  if (typeof mixpanel.config === 'undefined') return;
  console.debug(
    `[Mixpanel] Identifying as ${id} ${props && props.wallet ? `using wallet ${props.wallet}` : ''}`
  );
  mixpanel.identify(id);
  if (props) mixpanel.people.set(props);
};

export const userSnapInit = () => {
  // already injected
  if (document.getElementById('usersnap-script')) return;

  window.onUsersnapLoad = function(api) {
    api.init(config.userSnap.config);
    window.Usersnap = api;
  };

  const scriptUrl = `//api.usersnap.com/load/${
    config.userSnap.token
  }.js?onload=onUsersnapLoad`;
  const script = document.createElement('script');
  script.id = 'usersnap-script';
  script.src = scriptUrl;
  script.async = true;

  document.getElementsByTagName('head')[0].appendChild(script);
};

export const gaInit = () => {
  console.debug(
    `[GA] Tracking initialized for ${env} env using ${config.gaTrackingId}`
  );
  ReactGA.initialize(config.gaTrackingId);
};
