import promClient from "prom-client";

export const pendingLogsGauge = new promClient.Gauge({
  name: "pending_logs",
  help: "Number of pending logs",
});

export const finishedSuccessGauge = new promClient.Gauge({
  name: "finished_success_logs",
  help: "Number of finished success logs",
});

export const finishedFailedGauge = new promClient.Gauge({
  name: "finished_failed_logs",
  help: "Number of finished failed logs",
});

