import { Request, Response } from "express";
import { elasticSearchService } from "../Services/ElasticSearchService";
import { UnfinishedLogsService } from "../Services/QueryService";
import { VisualizeLogs } from "../Services/ChartService";

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

    const asd = await UnfinishedLogsService(logs);

    const canvas = VisualizeLogs(asd);

    res.status(200).json({ chartConfig: canvas, rawData: asd });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};
