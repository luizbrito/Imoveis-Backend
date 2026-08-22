import { auditLogActivityChartApiDoc } from './controllers/auditLogActivityChartController';
import { auditLogFindManyApiDoc } from './controllers/auditLogFindManyController';
import { buildPaths } from '../../shared/openapi/routeToPath';

export function getAuditLogPaths() {
  return buildPaths('AuditLog', [
    auditLogFindManyApiDoc,
    auditLogActivityChartApiDoc,
  ]);
}
