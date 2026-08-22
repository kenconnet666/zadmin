import type { RequestHandler } from './$types';

export const _status = Object.freeze({ app: 'etl', status: 'active' });

export const GET: RequestHandler = () => Response.json(_status);
