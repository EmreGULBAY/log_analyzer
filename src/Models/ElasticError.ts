export class ElasticError extends Error {
  status: number;
  msg: string;

  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
    this.msg = msg;
  }
}
