import React from 'react';
import { track } from './springloadAnalytics';

interface IEventBoundaryProps {
  triggerEvent?: string;
  eventName: string;
  payload: any;
  children: JSX.Element | JSX.Element[];
  sendTo?: string[];
}

const EventBoundary = ({
  triggerEvent = 'click',
  eventName,
  payload,
  sendTo,
  children,
}: IEventBoundaryProps): JSX.Element => {
  return (
    <React.Fragment>
      {React.Children.map(children, (element) => {
        if (!React.isValidElement(element)) return;

        const eventPropName = `on${
          triggerEvent.charAt(0).toUpperCase() + triggerEvent.slice(1)
        }`;
        const eventHandler = (event: React.SyntheticEvent) => {
          if ((element.props as any)[eventPropName]) {
            (element.props as any)[eventPropName](event);
          }
          payload = typeof payload === 'function' ? payload() : payload;
          track(eventName, payload, sendTo);
        };
        return React.cloneElement(element, { [eventPropName]: eventHandler });
      })}
    </React.Fragment>
  );
};

export default EventBoundary;
