export interface grouParams {
  frequency?: string;
  action?: string[];
  channelCode?: string[];
  status?: string;
  requestType?: string;
}

export interface logTypes {
  key_as_string: string;
  key: number;
  doc_count: number;
  by_channel: {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: {
      key: string;
      doc_count: number;
      by_action: {
        doc_count_error_upper_bound: number;
        sum_other_doc_count: number;
        buckets: {
          key: string;
          doc_count: number;
          by_request_type: {
            doc_count_error_upper_bound: number;
            sum_other_doc_count: number;
            buckets: [
              {
                key: string;
                doc_count: number;
                by_status: {
                  doc_count: number;
                  status_codes: {
                    doc_count_error_upper_bound: number;
                    sum_other_doc_count: number;
                    buckets: [];
                  };
                };
              },
              {
                key: string;
                doc_count: number;
                by_status: {
                  doc_count: number;
                  status_codes: {
                    doc_count_error_upper_bound: number;
                    sum_other_doc_count: number;
                    buckets: {
                      key: number;
                      doc_count: number;
                    }[];
                  };
                };
              }
            ];
          };
        }[];
      };
    }[];
  };
}

export interface finalResult {
  key: string;
  unfinished: number;
  finished: {
    status: number;
    count: number;
  }[];
}
