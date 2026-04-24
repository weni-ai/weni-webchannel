import { closeSessionMessage, disconnectServer, openSessionMessage } from 'actions';

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

export function socketOnClose() {
  console.log('%cSOCKET ONCLOSE', 'color: #F71963; font-weight: bold;', new Date());

  this.setState({ isConnected: false });

  if (!this.canReconnect) {
    return;
  }

  if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('%cSOCKET RECONNECT CAP REACHED', 'color: #F71963; font-weight: bold;', new Date());
    this.canReconnect = false;
    this.props.dispatch(disconnectServer());
    this.props.dispatch(openSessionMessage());
    return;
  }

  const delay = this.reconnectImmediate
    ? BASE_DELAY_MS
    : Math.min(BASE_DELAY_MS * (2 ** this.reconnectAttempts), MAX_DELAY_MS);

  if (this.reconnectionTimeout) {
    clearTimeout(this.reconnectionTimeout);
  }

  this.reconnectionTimeout = setTimeout(() => {
    this.reconnectAttempts += 1;
    this.attemptingReconnection = true;
    clearInterval(this.pingIntervalId);
    this.props.dispatch(closeSessionMessage());
    this.initializeWidget(true, true);
  }, delay);

  this.reconnectImmediate = false;
}
