import { z } from 'zod';

export interface RouteConfig {
  method: string;
  path: string;
  body?: z.ZodType<any>;
  params?: z.ZodType<any>;
  query?: z.ZodType<any>;
  response?: z.ZodType<any> | string;
  tags?: string[];
  security?: any[];
}

export function routeToPath(
  route: RouteConfig,
  tags: string[] = [],
  security: any[] = [],
) {
  const pathItem: any = {
    [route.method]: {
      tags: route.tags || tags,
      responses: {},
    },
  };

  // Add security if provided
  if (security.length > 0) {
    pathItem[route.method].security = security;
  }

  // Convert request body (simplified - always JSON)
  if (route.body) {
    pathItem[route.method].requestBody = {
      content: {
        'application/json': {
          schema: route.body,
        },
      },
    };
  }

  // Convert parameters
  const parameters: any[] = [];

  if (route.params) {
    const paramsSchema = route.params;
    if (paramsSchema instanceof z.ZodObject) {
      const shape = paramsSchema.shape;
      for (const [name, schema] of Object.entries(shape)) {
        parameters.push({
          name,
          in: 'path',
          required: true,
          schema,
        });
      }
    }
  }

  if (route.query) {
    const querySchema = route.query;
    if (querySchema instanceof z.ZodObject) {
      const shape = querySchema.shape;
      for (const [name, schema] of Object.entries(shape)) {
        parameters.push({
          name,
          in: 'query',
          required: !schema.isOptional(),
          schema,
        });
      }
    }
  }

  if (parameters.length > 0) {
    pathItem[route.method].parameters = parameters;
  }

  // Convert responses (simplified - 200 OK only)
  if (typeof route.response === 'string') {
    pathItem[route.method].responses['200'] = {
      description: route.response,
    };
  } else if (route.response) {
    pathItem[route.method].responses['200'] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: route.response,
        },
      },
    };
  } else {
    pathItem[route.method].responses['200'] = {
      description: 'OK',
    };
  }

  return pathItem;
}

export function buildPaths(
  tag: string,
  apiDocs: RouteConfig[],
  security: any[] = [],
) {
  const paths: Record<string, any> = {};

  for (const apiDoc of apiDocs) {
    const pathItem = routeToPath(apiDoc, [tag], security);
    if (!paths[apiDoc.path]) {
      paths[apiDoc.path] = {};
    }
    Object.assign(paths[apiDoc.path], pathItem);
  }

  return paths;
}
