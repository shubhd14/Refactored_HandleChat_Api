import {Request} from 'express';

export interface PluginFilter {
  recordCount?: number;
  pluginTypeName?: string;
  entityLogicalName?: string;
  messagename?: string;
  operationType?: string;
  correlationId?: string;
  userName?: string;
  errorMessage?: string;
  exceptionOnly?: boolean;
  maxduration?: number | string;
  minduration?: number | string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  processType?: string;
}

export interface PluginFilterRequest extends Request {
  body: {
    pluginfilter: PluginFilter;
  };
}