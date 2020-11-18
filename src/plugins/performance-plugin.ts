import Perfume from 'perfume.js';
import perfumePlugin from '@analytics/perfumejs';

// Track performance metrics
const performancePlugin = ({ sendTo }) => {
  const destinations = Array.isArray(sendTo)
    ? sendTo.reduce((acc, tracker) => ({ ...acc, [tracker]: true }), {})
    : { all: true };
  return perfumePlugin({
    perfume: Perfume,
    category: 'perfMetrics',
    destinations,
    perfumeOptions: {
      resourceTiming: true,
      elementTiming: true,
      maxMeasureTime: 15000,
    },
  });
};

export default performancePlugin;
