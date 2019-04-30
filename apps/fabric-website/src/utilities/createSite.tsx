import * as es6Promise from 'es6-promise';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { currentFabricBreakpoint } from '@uifabric/example-app-base/lib/utilities/windowWidth';
import { Fabric, setBaseUrl } from 'office-ui-fabric-react';
import { handleRedirects } from '@uifabric/example-app-base/lib/utilities/redirects';
import { INavPage, jumpToAnchor } from '@uifabric/example-app-base/lib/index2';
import { initializeIcons } from '@uifabric/icons/lib/index';
import { ISiteDefinition } from '@uifabric/example-app-base/lib/utilities/SiteDefinition.types';
import { Route, Router } from 'office-ui-fabric-react/lib/utilities/router/index';
import { Site } from '../components/Site/index';
import '../styles/styles.scss';
import 'whatwg-fetch';
// TODO: move to example-app-base once Site moves

// Polyfill needed by FeedbackList

// tslint:disable-next-line:no-any
const corePackageData = require<any>('office-ui-fabric-core/package.json');
const corePackageVersion: string = (corePackageData && corePackageData.version) || '9.2.0';

// Initialize
es6Promise.polyfill();
initializeIcons();

// @TODO: This doesn't appear to do anything right now. Investigate removing.
// @ts-ignore
const isProduction = process.argv.indexOf('--production') > -1;

// tslint:disable-next-line no-any
declare let Flight: any; // Flight & CDN configuration
declare let __webpack_public_path__: string;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname.indexOf('ngrok.io') > -1;

if (!isLocal && Flight.baseCDNUrl) {
  __webpack_public_path__ = Flight.baseCDNUrl;
}

if (!isProduction) {
  setBaseUrl('./dist/');
} else {
  setBaseUrl(__webpack_public_path__);
}

let rootElement: HTMLElement;
let scrollDistance: number;

export function createSite<TPlatforms extends string>(
  siteDefinition: ISiteDefinition<TPlatforms>,
  defaultRouteComponent?: React.ComponentType | React.ComponentType[]
) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    _onLoad();
  } else {
    window.onload = _onLoad;
  }
  window.onunload = _onUnload;

  function _getBreakpoint(): void {
    const currentBreakpoint = currentFabricBreakpoint();
    scrollDistance = currentBreakpoint === 'lg' ? 240 : 200;
  }

  function _createRoutes(pages: INavPage<TPlatforms>[]): JSX.Element[] {
    let routes: JSX.Element[] = [];
    pages.forEach((page: INavPage<TPlatforms>) => {
      routes.push(<Route key={page.url} path={page.url} component={page.component} getComponent={page.getComponent} />);
      if (page.platforms) {
        Object.keys(page.platforms).forEach((plat: TPlatforms) => {
          const platformPages: INavPage<TPlatforms>[] = page.platforms && page.platforms[plat];
          routes = routes.concat(_createRoutes(platformPages || []));
        });
      }
      if (page.pages) {
        routes = routes.concat(_createRoutes(page.pages));
      }
    });
    return routes;
  }

  function _getSiteRoutes() {
    const routes: JSX.Element[] = _createRoutes(siteDefinition.pages);

    // Add the default route
    if (defaultRouteComponent) {
      if (Array.isArray(defaultRouteComponent)) {
        defaultRouteComponent.forEach((Component, index) => {
          routes.push(<Route key={`default${index}`} component={Component} />);
        });
      } else {
        routes.push(<Route key="home" component={defaultRouteComponent} />);
      }
    }

    return routes;
  }

  function _onLoad(): void {
    if (!window.location.hash) {
      window.location.hash = '#/';
    }

    handleRedirects(siteDefinition.redirects);

    // Load the app into this element.
    rootElement = rootElement || document.getElementById('main');
    _getBreakpoint();

    const renderSite = (props: {}) => <Site siteDefinition={siteDefinition} {...props} />;

    const routerDidMount = () => jumpToAnchor(undefined, scrollDistance);

    ReactDOM.render(
      <Fabric>
        <Router onNewRouteLoaded={routerDidMount}>
          <Route component={renderSite}>{_getSiteRoutes()}</Route>
        </Router>
      </Fabric>,
      rootElement
    );
  }

  function _onUnload() {
    if (rootElement) {
      ReactDOM.unmountComponentAtNode(rootElement);
    }
  }
}

function addCSSToHeader(fileName: string): void {
  const headEl = document.head;
  const linkEl = document.createElement('link');

  linkEl.type = 'text/css';
  linkEl.rel = 'stylesheet';
  linkEl.href = fileName;
  headEl.appendChild(linkEl);
}

addCSSToHeader('https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/' + corePackageVersion + '/css/fabric.min.css');
