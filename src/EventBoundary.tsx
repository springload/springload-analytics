import React from 'react';
import { track } from './springloadAnalytics';

interface IEventBoundaryProps {
  event: string; 
  action: string; 
  payload: any; 
  children: React.ReactChildren;
  sendTo?: string[]; 
}

const EventBoundary = ({ event, action, payload, sendTo, children }: IEventBoundaryProps) => {
  return React.Children.map(children, element => {
    if (!React.isValidElement(element)) return
    
    const eventPropName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    const eventHandler = (event: React.SyntheticEvent) => {
      if ((element.props as any)[eventPropName]) {
        (element.props as any)[eventPropName](event);
      }
      payload = (typeof payload === 'function') ? payload() : payload;
      track(action, payload, sendTo);
    }
    React.cloneElement(element, { [eventPropName]: eventHandler });
  });
};

export default EventBoundary;
