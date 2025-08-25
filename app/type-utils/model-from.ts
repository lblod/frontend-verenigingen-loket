import type Route from '@ember/routing/route';

/** Get the resolved model value from a route. */
// Source: https://guides.emberjs.com/release/typescript/core-concepts/routing/#toc_working-with-route-models
export type ModelFrom<R extends Route> = Awaited<ReturnType<R['model']>>;
