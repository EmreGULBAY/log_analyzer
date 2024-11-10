import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import { ElasticError } from "../Models/ElasticError";
import { initLog, finalLog, actionTypes, channelCodes, statusTypes } from "../Models/LogModels";
import { v4 as uuidv4 } from "uuid";

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
      const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const channel = channelCodes[Math.floor(Math.random() * channelCodes.length)];
      
      const newInitLog = {
        ...initLog,
        invocationId,
        action,
        channelCode: channel,
        "@timestamp": new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
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
        "@timestamp": new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
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
        console.error('Bulk insert errors:', response.items.filter(item => item.index?.error));
      }
    }
  }

  public async indexLog() {
    try {
      await this.checkHealth();
      
      const logs = this.createRandomLog(500000);
      
      const operations = logs.flatMap(doc => [
        { index: { _index: 'logs' } },
        doc
      ]);

      await this.bulkInsert(operations);
      
      return { message: `Successfully indexed ${logs.length} logs` };
    } catch (e) {
      console.error("Index log error:", e);
      throw new ElasticError(500, "Index log error");
    }
  }
}

export const elasticSearchService = new ElasticSearch();

