import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  auditLogActivityChartInputSchema,
  auditLogActivityChartOutputSchema,
} from '../auditLogSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

dayjs.extend(utc);
dayjs.extend(timezone);

export const auditLogActivityChartApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/audit-log/activity-chart',
  query: auditLogActivityChartInputSchema,
  response: auditLogActivityChartOutputSchema,
};

export const auditLogActivityChartMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'audit_log_activity_chart',
  description: dictionary.auditLog.mcpDescription.activityChart,
  requiredPermissions: { auditLog: ['read'] },
  schema: toMcpJsonSchema(auditLogActivityChartInputSchema),
  handler: async (params, context) => {
    return await auditLogActivityChartController(params, context);
  },
});

export async function auditLogActivityChartController(
  query: any,
  context: AppContext,
): Promise<z.output<typeof auditLogActivityChartOutputSchema>> {
  const { timezone } = auditLogActivityChartInputSchema.parse(query);

  const { currentOrganization } = await authGuardBackend(
    {
      auditLog: ['read'],
    },
    context,
  );

  const oneWeekAgo = dayjs()
    .tz(timezone)
    .startOf('day')
    .subtract(1, 'week')
    .toDate();

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      // Defense in depth: explicit organizationId filter + RLS at database level
      const rows: Array<any> = await tx.$queryRaw`
      SELECT date_trunc('day', "timestamp" AT TIME ZONE ${timezone}) as "timestamp", count(1)
      FROM "AuditLog"
      WHERE "timestamp" > ${oneWeekAgo}
        AND "organizationId" = ${currentOrganization.id}::uuid
      GROUP BY 1
      ORDER BY "timestamp" desc;
    `;

      return rows.map((row) => {
        return {
          timestamp: row.timestamp.toISOString().split('T')[0],
          count: row.count,
        };
      });
    },
  );
}
