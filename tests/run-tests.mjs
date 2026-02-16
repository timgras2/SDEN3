import { runSchedulerTests } from "./scheduler.test.js";
import { runSessionQueueTests } from "./session-queue.test.js";

const suites = [
  { name: "scheduler", run: runSchedulerTests },
  { name: "session-queue", run: runSessionQueueTests },
];

let failed = 0;

for (const suite of suites) {
  try {
    suite.run();
    console.log(`PASS ${suite.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${suite.name}`);
    console.error(error?.stack || error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
  console.error(`\n${failed} suite(s) failed.`);
} else {
  console.log("\nAll test suites passed.");
}
