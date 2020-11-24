# Springload Analytics

> Event tracker inspired by springload-analytics.js.

This library rewrite the previous `springload-analytics.js` to and add integration of `Perfume.js` to track the performance metrics in browser.

## Install

```bash
npm install @springload/springload-analytics
yarn add @springload/springload-analytics
```

## Basic setup

Just add a data-analytics attribute to a container with links you want to track. Every link in that container will be tracked using the default category (uri), default action (click), default label (href), and default value (undefined).

```html
<div data-analytics>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about-us/">About us</a></li>
    <li><a href="/contact-us/">Contact us</a></li>
  </ul>
</div>
```

```javascript
import SpringloadAnalytics, { googleAnalyticsPlugin, tecPlugin } from "springload-analytics";

const analytics = SpringloadAnalytics({
  trackerPlugins: [
    googleAnalyticsPlugin({
      trackingId: "UA-12341131-6",
    }),
    tecPlugin({
      trackerUrl: "/event";
      applicationVersion: "ert7565456asd";
    })
  ]
});
```

The built-in google analytics tracker now is replaced by manually passsing tracker plugins in to initialization function which allow users to customize their own tracker based on project requirement. 

## Performance metrics

**Perfume.js** is a tiny, web performance monitoring library that reports field data back to your favorite analytics tool.
`springload-analytics` sends performance metrics to Google Analytics using **perfume.js**.

**Perfume.js** tracks the following performance mertrics:

- First Paint (fp)
- First Contentful Paint (fcp)
- Largest Contentful Paint (lcp)
- Largest Contentful Paint Final (lcpFinal)
- First Input Delay (fid)
- Cumulative Layout Shift (cls) 0-0.1
- Cumulative Layout Shift Final (clsFinal)
- Total Blocking Time (tbt)
- Total Blocking Time 5S (tbt5S)
- Total Blocking Time 10S (tbt10S)
- Total Blocking Time Final (tbtFinal)

Performance tracking is enabled by passing performancePlugin instance to `trackerPlugins` is initialization funciton argument, You can specific the trackers you would like the tracking data be sent to in `sendTo` otherwise the data will be sent to all trackers.

```javascript
import SpringloadAnalytics, { performancePlugin } from "springload-analytics";

const analytics = SpringloadAnalytics({
  trackerPlugins: [
    // ...other tracker plugins
    performancePlugin({
      sendTo: ["google-analytics"]
    }),
  ]
});
```

## API Reference

### Configuration

After initialization with config, the core API is exposed & ready for use in the application.

| Option             | Default                 | Description                                                                                                                                                                                                                             |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| separator          | '&#x7c;'                | The charactor used to separate the content of `data-analytics` attribute into tracking variables `category`, `action`, `label` and `value`.                                                                                             |
| trackPerformance   | true                    | Toggle for tracking performance including these [metrics](https://github.com/zizzamia/perfume.js#web-vitals-score) by default.                                                                                                          |
| trackableAttribute | 'analytics'             | The attribute name following `data-` attached to the trackable elements.                                                                                                                                                                |
| trackableEvent     | 'click'                 | The event need to be tracked on trackable elements.                                                                                                                                                                                     |

```javascript
const analytics = SpringloadAnalytics({
    category: "my-website",
    separator: ":"
    trackPerformance: false,
    trackableEvent: "hover",
});
```

### Page

Trigger page view measurement calls in Google analytics. It's a equivalent to [`analytics.page`](https://github.com/DavidWells/analytics#analyticspage).

**Arguments:**

- [data] (optional) PageData - Page data overrides.
- [options] (optional) Object - Page tracking options
- [callback] (optional) Function - Callback to fire after page view call completes

```javascript
// Basic page tracking
analytics.page();

// Page tracking with page data overrides
analytics.page({
  url: "https://google.com",
});

// Fire callback with 1st, 2nd or 3rd argument
analytics.page(() => {
  console.log("do this after page");
});

// Send pageview to only to specific analytic tools
analytics.page(
  {},
  ['google-analytics'],
);
```

## Custom tracking

For more targeted tracking you can specify a category, action or value by populating the data-analytics attribute with pipe (|) separated values.

```html
<!-- E.g. Use custom category, custom action, custom label and a custom value -->
<a data-analytics="Top navigation|Link click|Homepage link|1" href="/">Home</a>

<!-- E.g. Use custom label only -->
<a data-analytics="||Homepage link" href="/">Home</a>

<!-- E.g. Use custom action only -->
<a data-analytics="|Slide Next" href="#">Next</a>

<!-- E.g. Use custom value only -->
<a data-analytics="|||1" href="/">Home</a>

<!-- E.g. Use custom category and custom label only -->
<a data-analytics="UI Elements||Show data" href="#">Show</a>

<!-- E.g. Use custom category and custom value only -->
<a data-analytics="UI Elements|||1" href="#">Show</a>

<!-- E.g. Custom track a group of elements with custom category and action -->
<div data-analytics="Top navigation|Link click">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about-us/">About us</a></li>
    <li><a href="/contact-us/">Contact us</a></li>
  </ul>
</div>
```

## Tracking dynamically

You can track within a JavaScript file by calling the track method:

```javascript
// Specify action and payload.
analytics.track(action, {
  label, 
  value,
  category,
});

// Not specify category will use default category.
analytics.track(action, {
  label, 
  value,
});

// Specify the trackers that will receive the payload, by default it'll be sent to all tracker.
analytics.track(action, {
  label, 
  value,
}, ['tec']);
```

## Setup additional trackable elements on the fly

You can set up additional/alternative trackable elements on the fly by calling `setupTrackables`:

```javascript
analytics.setupTrackables({
  trackableAttribute: "google-analytics",
  trackableEvent: "mouseenter",
  separator: ":",
  action: "hover read more",
  payloadKeys: ["page", "section"],
  sendTo: ['google-analytics'], // Not specific it will send to all trackers
});
```

The markup for this example would be:

```html
<div data-google-analytics="home:header">
  <span>Read more</span>
</div>
```
