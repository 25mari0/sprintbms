export const includesRoute = <T extends string>(
    routes: readonly T[],
    path: string
  ): path is T => routes.includes(path as T);