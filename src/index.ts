import { config, logConfig } from './shared/config/env.config.js';

console.log('Starting HelpDesk application...');
logConfig();

const server = {
  port: config.port,
  start() {
    console.log(`Server ready on port ${this.port}`);
  }
};

server.start();
