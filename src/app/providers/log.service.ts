import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  loglevel: string = "debug";

  constructor() {
    console.debug("### INIT LogService");
  }

  debug(content: string) {
    // write debug log
    if (this.loglevel == 'debug') {
      console.debug(content);
    }
  }

  info(content: string) {
    // write info log
    if (this.loglevel == 'debug' || this.loglevel == 'info') {
      console.info(content);
    }
  }

  error(content: string) {
    // write error log
    if (this.loglevel == 'debug' || this.loglevel == 'info' || this.loglevel == 'error') {
      console.error(content);
    }
  }
}
