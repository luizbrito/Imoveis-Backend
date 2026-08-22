import { AppContext } from '../../shared/controller/appContext';
import type { PartialPermissions } from '../permissions';

export interface McpTool {
  name: string;
  description: string;
  requiredPermissions: PartialPermissions;
  schema: object;
  handler: (params: any, context: AppContext) => Promise<any>;
}
