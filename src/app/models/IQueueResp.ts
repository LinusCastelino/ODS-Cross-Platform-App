export interface IQueueResp {
    attempts : string;
    progressbar : DoubleRange
    bytes : {
        avg : BigInteger
        done : BigInteger
        inst : BigInteger
        total : BigInteger
    };
    dest : {
        id : string
        type : string
        uri : string
    }
    files : string
    job_id : string
    max_attempts : string
    message : string
    owner : string
    src : {
        id : string
        type : string
        uri : string
    }
    status : string
    times : {
        completed : string
        scheduled : string
        started : string
    }
  }