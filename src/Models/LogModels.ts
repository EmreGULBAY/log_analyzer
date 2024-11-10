export const initLog = {
  requestTypes: ["InitialRequest"],
  invocationId: "c7dcde39-3487-4a85-96d1-37f7b9a500c1",
  requestUrl:
    "/agoda?hotelId=25302&action=reservation&timeout=120000&hotelChannelManagerId=10168&invocationId=c7dcde39-3487-4a85-96d1-37f7b9a500c1",
  clientIp: "::ffff:10.13.7.151",
  requestHeaders: {
    accept: "application/json, text/plain, */*",
    "user-agent": "axios/0.26.1",
    host: "ewebchm-worker-res:8000",
    connection: "keep-alive",
  },
  requestMethod: "GET",
  requestQuery: {
    hotelId: "25302",
    action: "reservation",
    timeout: "120000",
    hotelChannelManagerId: "10168",
    invocationId: "c7dcde39-3487-4a85-96d1-37f7b9a500c1",
  },
  requestBody: "{}",
  channelCode: "agoda",
  action: "reservation",
  hotelId: "25302",
  "@timestamp": "2024-11-08T11:53:15.872Z",
  pid: 1,
  hostname: "ewebchm-worker-res-66c476f6bf-t9z5j",
};

export const finalLog = {
  requestTypes: ["FinalResponse"],
  invocationId: "c7dcde39-3487-4a85-96d1-37f7b9a500c1",
  status: 200,
  headers: {
    "x-powered-by": "Express",
    "access-control-allow-origin": "*",
    "cache-control":
      "private,no-cache,no-store,max-age=0,must-revalidate,pre-check=0,post-check=0",
    "content-type": "text/plain; charset=utf-8",
    "content-length": "13",
    etag: 'W/"d-ztl/MS2iclQRb8E0e8b20MinPfs"',
  },
  body: "OK, no data..",
  channelCode: "Agoda",
  action: "reservation",
  hotelId: "25302",
  "@timestamp": "2024-11-08T11:53:15.942Z",
  pid: 1,
  hostname: "ewebchm-worker-res-66c476f6bf-t9z5j",
};

export const actionTypes = ["reservation", "cancel", "update"];
export const channelCodes = ["agoda", "booking", "expedia", "trivago"];
export const statusTypes = [200, 500];
