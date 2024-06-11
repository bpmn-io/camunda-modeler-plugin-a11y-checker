import axe from 'axe-core';
import debug from 'debug';

const log = debug('plugin:a11y-checker');

const TIMEOUT = 2000;
const DEFAULT_TAGS = [ 'wcag2a', 'wcag21a' ];

const cache = new Set();
const reportedViolations = [];

export function A11yChecker(props) {
  setup();

  return null;
}

let setupCalled = false;
function setup() {
  if (setupCalled) {
    return;
  }
  setupCalled = true;

  window.__A11Y_CHECKER__ = {
    getViolations: () => reportedViolations.slice()
  };

  scheduleTest();
}

function scheduleTest() {
  requestIdleCallback(async () => {
    await testA11y();
    scheduleTest();
  }, { timeout: TIMEOUT });
}

async function testA11y() {
  const result = await scan();
  const newViolations = getNewViolations(result.violations);

  if (!newViolations.length) {
    return;
  }

  reportedViolations.push(...newViolations);

  log('New a11y violations', newViolations);
}

function scan() {
  return axe.run({
    runOnly: {
      type: 'tag',
      values: DEFAULT_TAGS
    }
  });
}

function getNewViolations(violations) {
  return violations.filter(report => {
    report.nodes = report.nodes.filter(node => {
      const key = `${node.target}${node.id}`;
      const isNew = !cache.has(key);
      cache.add(key);

      return isNew;
    });

    return report.nodes.length;
  });
}
