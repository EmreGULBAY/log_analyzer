import { Request, Response } from "express";
import {
  elasticSearchService,
  logTypes,
} from "../Services/ElasticSearchService";

export const QueryController = async (req: Request, res: Response) => {
  try {
    const { frequency, action, channelCode, status, requestType } = req.body;

    const logs = await elasticSearchService.getLogs({
      frequency,
      action,
      channelCode,
      status,
      requestType,
    });

    res.status(200).json(logs);
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const UnfinishedLogsController = async (req: Request, res: Response) => {
  try {
    const { frequency, action, channelCode, status, requestType } = req.body;
    const initiaLogs = await elasticSearchService.getLogs({
      requestType: "InitialRequest",
    });

    const initialLogsBucket = Object.values(
      initiaLogs?.requests_over_time!
    )[0] as logTypes[];

    const finalLogs = await elasticSearchService.getLogs({
      requestType: "FinalResponse",
    });

    const finalLogsBucket = Object.values(
      finalLogs?.requests_over_time!
    )[0] as logTypes[];

    const unfinishedLogs = initialLogsBucket.map((log) => {
      return {
        key: log.key_as_string,
        diff:
          log.doc_count -
          (finalLogsBucket.find((finalLog) => finalLog.key === log.key)
            ?.doc_count ?? 0),
      };
    });

    res.json(unfinishedLogs);
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};
