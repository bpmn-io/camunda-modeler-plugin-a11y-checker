import React from 'react';
import axe from 'axe-core';
import debug from 'debug';

import { A11yCheckerUI } from './ui';

const log = debug('plugin:a11y-checker');

const TIMEOUT = 2000;
const DEFAULT_TAGS = [ 'wcag2a', 'wcag21a' ];


export function A11yChecker(props) {
  const [ violations, setViolations ] = React.useState([]);

  const onNewViolations = newViolations => {
    setViolations(violations => violations.concat(newViolations));
    log('New a11y violations', newViolations);
  };

  useA11yChecker(onNewViolations, [ setViolations ]);

  return <A11yCheckerUI violations={ violations } />;
}

function useA11yChecker(callback, deps) {
  React.useEffect(() => {
    const checker = new Checker();
    checker.start(callback);

    return () => {
      checker.stop();
    };
  }, deps);
}

class Checker {
  constructor() {
    this._violations = [];
    this._cache = new Set();
    this._listener = () => {};
    this._scheduleChecks = this._scheduleChecks.bind(this);
  }

  start(listener) {
    this._listener = listener;
    this._scheduleChecks();
  }

  stop() {
    cancelIdleCallback(this._callbackId);
  }

  onNewViolations(violations) {
    this._listener(violations);
  }

  _scheduleChecks() {
    this._callbackId = requestIdleCallback(async () => {
      await this._checkA11y();
      this._scheduleChecks();
    }, { timeout: TIMEOUT });
  }

  async _checkA11y() {
    const result = await scan();
    const newViolations = this._getNewViolations(result.violations);

    if (!newViolations.length) {
      return;
    }

    this.onNewViolations(newViolations);
  }

  _getNewViolations(violations) {
    return violations.filter(report => {
      report.nodes = report.nodes.filter(node => {
        const key = `${node.target}${node.id}`;
        const isNew = !this._cache.has(key);
        this._cache.add(key);

        return isNew;
      });

      return report.nodes.length;
    });
  }
}

function scan() {
  return axe.run({
    runOnly: {
      type: 'tag',
      values: DEFAULT_TAGS
    }
  });
}
