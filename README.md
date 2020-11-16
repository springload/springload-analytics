# Springload Analytics

> Google analytics tracker inspired by springload-analytics.js.

This library rewrite the previous `springload-analytics.js` to and add integration of `Perfume.js` to track the performance metrics in browser.

## Requirements

This requires the async version of the Google Analytics snippet to be loaded in the page.

## Install

```bash
npm install springload/springload-analystics
yarn add springload/springload-analystics
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
import SpringloadAnalytics from "springload-analytics";

const analytics = SpringloadAnalytics({
  trackingId: "UA-12341131-6",
});
```

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

Performance tracking is enabled by default, it can be closed by passing the option `trackPerformance: false` in the configuration object.

## API Reference

### Configuration

After initialization with config, the core API is exposed & ready for use in the application.

| Option             | Default                 | Description                                                                                                                                                                                                                             |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trackingId         | null                    | The measurement ID / web property ID. The format is UA-XXXX-Y.                                                                                                                                                                          |
| trackerName        | null                    | Custom tracker name for google analytics. Use this if you need multiple googleAnalytics scripts loaded.                                                                                                                                 |
| category           | The pathname of the URI | Name of event category.                                                                                                                                                                                                                 |
| separator          | '&#x7c;'                | The charactor used to separate the content of `data-analytics` attribute into tracking variables `category`, `action`, `label` and `value`.                                                                                             |
| trackPerformance   | true                    | Toggle for tracking performance including these [metrics](https://github.com/zizzamia/perfume.js#web-vitals-score) by default.                                                                                                          |
| trackableAttribute | 'analytics'             | The attribute name following `data-` attached to the trackable elements.                                                                                                                                                                |
| trackableEvent     | 'click'                 | The event need to be tracked on trackable elements.                                                                                                                                                                                     |
| labelIsNextContent | true                    | Use element's text content as label if it's not specified in analytics attribute.                                                                                                                                                       |
| labelAttribute     | 'href'                  | Use this attribute as label if label is not specified in analytics attribute or element's text content when `labelIsNextContent` is true.                                                                                               |
| googleTasks        | {}                      | An object used to customize how google analytics validates, constructs, and sends measurement protocol requests. See [set custom google analytic tasks](https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks) |

```javascript
const analytics = SpringloadAnalytics({
    trackingId: 'UA-12341131-6',
    trackerName: 'clientTracker',
    category: 'my-website',
    trackPerformance: false,
    trackableEvent: 'hover',
    googleTasks: {
      sendHitTask: function(model) {
        console.log(model.get('hitPayload')
      },
    },
});
```

### TrackScreenView

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

// Disable sending this pageview to specific analytic tools
analytics.page(
  {},
  {
    plugins: {
      // disable page tracking event for segment
      segment: false,
    },
  }
);

// Send pageview to only to specific analytic tools
analytics.page(
  {},
  {
    plugins: {
      // disable this specific page in all plugins except customerio
      all: false,
      customerio: true,
    },
  }
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
// Specify a label, category and action.
analytics.track(label, category, action);

// Specify only a label - will use default category and action.
analytics.track(label);

// Specify a label, category, action and value.
analytics.track(label, category, action, value);
```

## Setup additional trackable elements on the fly

You can set up additional/alternative trackable elements on the fly by calling `setupTrackables`:

```javascript
analytics.setupTrackables({
  separator: ":",
  trackableAttribute: "google-analytics",
  trackableEvent: "mouseenter",
  labelIsNextContent: false,
  labelAttribute: "data-label",
});
```

The markup for this example would be:

```html
<div data-analytics="home">
  <span data-label="Viewed on hover">Read more</span>
</div>
```
