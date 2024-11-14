import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import { ElasticError } from "../Models/ElasticError";
import {
  initLog,
  finalLog,
  actionTypes,
  channelCodes,
  statusTypes,
} from "../Models/LogModels";
import { v4 as uuidv4 } from "uuid";
import { grouParams } from "../Interfaces/LogInterface";

dotenv.config();

class ElasticSearch {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTIC_PATH,
      auth: {
        username: process.env.ELASTIC_AUTH?.split(":")[0] || "",
        password: process.env.ELASTIC_AUTH?.split(":")[1] || "",
      },
      tls: {
        rejectUnauthorized:
          process.env.ELASTIC_TLS_REJECT_UNAUTHORIZED === "true",
      },
    });
  }

  private createRandomLog(count: number) {
    const logs = [];
    const initLogs = [];

    for (let i = 0; i < count; i++) {
      const invocationId = uuidv4();
      const action =
        actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const channel =
        channelCodes[Math.floor(Math.random() * channelCodes.length)];

      const newInitLog = {
        ...initLog,
        invocationId,
        action,
        channelCode: channel,
        "@timestamp": new Date(
          Date.now() - Math.floor(Math.random() * 86400000)
        ).toISOString(),
      };

      logs.push(newInitLog);
      initLogs.push({ invocationId, action, channel });
    }

    const finalLogsCount = Math.floor(count * 0.9);
    for (let i = 0; i < finalLogsCount; i++) {
      const { invocationId, action, channel } = initLogs[i];

      const newFinalLog = {
        ...finalLog,
        invocationId,
        action,
        channelCode: channel,
        status: statusTypes[Math.floor(Math.random() * statusTypes.length)],
        "@timestamp": new Date(
          Date.now() - Math.floor(Math.random() * 86400000)
        ).toISOString(),
      };

      logs.push(newFinalLog);
    }

    return logs;
  }

  private async checkHealth() {
    try {
      const health = await this.client.cluster.health();

      if (health.status === "red") {
        throw new ElasticError(500, "Elasticsearch is not healthy");
      }
    } catch (e) {
      console.error("Health check error:", e);
      throw new ElasticError(500, "Elasticsearch health check error");
    }
  }

  private async bulkInsert(operations: any[]) {
    const CHUNK_SIZE = 1000;
    const chunks = [];

    for (let i = 0; i < operations.length; i += CHUNK_SIZE * 2) {
      chunks.push(operations.slice(i, i + CHUNK_SIZE * 2));
    }

    for (const chunk of chunks) {
      const response = await this.client.bulk({ operations: chunk });
      if (response.errors) {
        console.error(
          "Bulk insert errors:",
          response.items.filter((item) => item.index?.error)
        );
      }
    }
  }

  public async indexLog() {
    try {
      await this.checkHealth();

      const logs = this.createRandomLog(20000);

      const operations = logs.flatMap((doc) => [
        { index: { _index: "logs" } },
        doc,
      ]);

      await this.bulkInsert(operations);

      return { message: `Successfully indexed ${logs.length} logs` };
    } catch (e) {
      console.error("Index log error:", e);
      throw new ElasticError(500, "Index log error");
    }
  }

  private buildLogsQuery({
    frequency = "5m",
    action,
    channelCode,
    requestType,
  }: grouParams) {
    try {
      const query: any = {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  gte: `now-${
                    Number(frequency.slice(0, -1)) * 30 + frequency.slice(-1)
                  }`,
                  lte: "now",
                },
              },
            },
          ],
        },
      };

      if (channelCode && channelCode.length > 0) {
        query.bool.must.push({
          bool: {
            should: channelCode.map((code) => ({
              term: {
                channelCode: code,
              },
            })),
            minimum_should_match: 1,
          },
        });
      }

      if (action && action.length > 0) {
        query.bool.must.push({
          bool: {
            should: action.map((act) => ({
              term: {
                "action.keyword": act,
              },
            })),
            minimum_should_match: 1,
          },
        });
      }

      if (requestType) {
        query.bool.must.push({
          term: {
            "requestType.keyword": requestType,
          },
        });
      }

      const aggs = {
        requests_over_time: {
          date_histogram: {
            field: "@timestamp",
            fixed_interval: frequency,
            min_doc_count: 0,
            extended_bounds: {
              min: `now-${
                Number(frequency.slice(0, -1)) * 30 + frequency.slice(-1)
              }`,
              max: "now",
            },
          },
          aggs: {
            by_channel: {
              terms: {
                field: "channelCode.keyword",
                size: 90,
              },
              aggs: {
                by_action: {
                  terms: {
                    field: "action.keyword",
                    size: 10,
                  },
                  aggs: {
                    by_request_type: {
                      terms: {
                        field: "requestTypes.keyword",
                        size: 10,
                      },
                      aggs: {
                        by_status: {
                          filter: {
                            term: {
                              "requestTypes.keyword": "FinalResponse",
                            },
                          },
                          aggs: {
                            status_codes: {
                              terms: {
                                field: "status",
                                size: 10,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      return { query, aggs };
    } catch (e) {
      console.error("Build logs query error:", e);
      throw new ElasticError(500, "Build logs query error");
    }
  }

  public async getLogs(params: grouParams) {
    try {
      await this.checkHealth();

      const response = await this.client.search({
        index: "logs",
        body: this.buildLogsQuery(params),
      });

      return response.aggregations;
    } catch (e) {
      console.error("Get logs error:", e);
      throw new ElasticError(500, "Get logs error");
    }
  }
}

export const elasticSearchService = new ElasticSearch();
