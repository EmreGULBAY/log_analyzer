import { AggregationsAggregate } from "@elastic/elasticsearch/lib/api/types";
import { finalResult, logTypes } from "../Interfaces/LogInterface";
import {
  finishedFailedGauge,
  finishedSuccessGauge,
  pendingLogsGauge,
} from "./PromClient";

export const UnfinishedLogsService = (
  logs: Record<string, AggregationsAggregate> | undefined
): finalResult[] => {
  if (!logs?.requests_over_time) {
    return [];
  }

  try {
    const initialLogs = logs.requests_over_time;
    const initialLogsBucket = Object.values(
      initialLogs
    )[0] as any as logTypes[];

    let pending = 0;
    let failed = 0;
    let success = 0;

    const result = initialLogsBucket.map((log) => {
      let totalInitial = 0;
      let totalFinal = 0;
      const statusMap = new Map<number, number>();

      for (const channel of log.by_channel.buckets) {
        for (const action of channel.by_action.buckets) {
          const initialCount = action.by_request_type.buckets[0].doc_count || 0;
          const finalCount = action.by_request_type.buckets[1].doc_count || 0;

          action.by_request_type.buckets[1].by_status.status_codes.buckets.forEach(
            (status) => {
              const currentCount = statusMap.get(status.key) || 0;
              statusMap.set(status.key, currentCount + status.doc_count);
            }
          );

          totalInitial += initialCount;
          totalFinal += finalCount;
        }
      }

      const resultStatus = Array.from(statusMap.entries()).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      pendingLogsGauge.inc(totalInitial - totalFinal);

      resultStatus.forEach((obj) => {
        if (obj.status.toString().startsWith("2")) {
          success += obj.count;
        } else {
          failed += obj.count;
        }
      });

      pending += totalInitial - totalFinal;

      return {
        key: log.key_as_string,
        unfinished: totalInitial - totalFinal,
        finished: resultStatus,
      };
    });

    finishedSuccessGauge.set(success);
    finishedFailedGauge.set(failed);
    pendingLogsGauge.set(pending);

    return result;
  } catch (e) {
    console.error("Error processing unfinished logs:", e);
    return [];
  }
};
