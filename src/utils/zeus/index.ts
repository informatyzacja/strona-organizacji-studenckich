/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";

export const HOST = "Specify host";

export const HEADERS = {};
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + "?query=" + encodeURIComponent(query);
    const wsString = queryString.replace("http", "ws");
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error("No websockets implemented");
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === "GET") {
      return fetch(
        `${options[0]}?query=${encodeURIComponent(query)}`,
        fetchOptions,
      )
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = "",
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return "";
    }
    if (typeof o === "boolean" || typeof o === "number") {
      return k;
    }
    if (typeof o === "string") {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join("\n");
    }
    const hasOperationName =
      root && options?.operationName ? " " + options.operationName : "";
    const keyForDirectives = o.__directives ?? "";
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map((e) =>
        ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars),
      )
      .join("\n")}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars
      .map((v) => `${v.name}: ${v.graphQLType}`)
      .join(", ");
    return `${k} ${keyForDirectives}${hasOperationName}${
      varsString ? `(${varsString})` : ""
    } ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (
        fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void,
      ) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    "Content-Type": "application/json",
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(
    initialOp as string,
    ops[initialOp],
    initialZeusQuery,
  );
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(
      initialOp as string,
      response,
      [ops[initialOp]],
    );
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p: string[] = [],
  ): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder =
        resolvers[currentScalarString.split(".")[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string" ||
      !o
    ) {
      return o;
    }
    const entries = Object.entries(o).map(
      ([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const,
    );
    const objectFromEntries = entries.reduce<Record<string, unknown>>(
      (a, [k, v]) => {
        a[k] = v;
        return a;
      },
      {},
    );
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | "enum"
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]:
    | undefined
    | boolean
    | string
    | number
    | [any, undefined | boolean | InputValueType]
    | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = "|";

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super("");
    console.error(response);
  }
  toString() {
    return "GraphQL Response Error";
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops
  ? (typeof Ops)[O]
  : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (
  mappedParts: string[],
  returns: ReturnTypesType,
): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === "object") {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({
  ops,
  returns,
}: {
  returns: ReturnTypesType;
  ops: Operations;
}) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string"
    ) {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith("scalar")) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment
            ? pOriginals
            : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) =>
  k.replace(/\([^)]*\)/g, "").replace(/^[^:]*\:/g, "");

const mapPart = (p: string) => {
  const [isArg, isField] = p.split("<>");
  if (isField) {
    return {
      v: isField,
      __type: "field",
    } as const;
  }
  return {
    v: isArg,
    __type: "arg",
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations,
) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === "enum" && mappedParts.length === 1) {
      return "enum";
    }
    if (
      typeof propsP1 === "string" &&
      propsP1.startsWith("scalar.") &&
      mappedParts.length === 1
    ) {
      return propsP1;
    }
    if (typeof propsP1 === "object") {
      if (mappedParts.length < 2) {
        return "not";
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === "string") {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === "object") {
        if (mappedParts.length < 3) {
          return "not";
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === "arg") {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return "not";
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === "object") {
      if (mappedParts.length < 2) return "not";
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): "enum" | "not" | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return "not";
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = "", root = true): string => {
    if (typeof a === "string") {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a
          .replace(START_VAR_NAME, "$")
          .split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith("scalar.")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split(".");
      const scalarKey = splittedScalar.join(".");
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(", ")}]`;
    }
    if (typeof a === "string") {
      if (checkType === "enum") {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === "object") {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== "undefined")
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(",\n");
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <
  X,
  T extends keyof ResolverInputTypes,
  Z extends keyof ResolverInputTypes[T],
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any]
      ? Input
      : any,
    source: any,
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X
    : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends "scalar" & {
  name: infer T;
}
  ? T extends keyof SCLR
    ? SCLR[T]["decode"] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]["decode"]>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> =
  T extends Array<infer R> ? InputType<R, U, SCLR>[] : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<
  SRC extends DeepAnify<DST>,
  DST,
  SCLR extends ScalarDefinition,
> =
  FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
    ? {
        [P in keyof SRC]: SRC[P] extends "__union" & infer R
          ? P extends keyof DST
            ? IsArray<
                R,
                "__typename" extends keyof DST
                  ? DST[P] & { __typename: true }
                  : DST[P],
                SCLR
              >
            : IsArray<
                R,
                "__typename" extends keyof DST
                  ? { __typename: true }
                  : Record<string, never>,
                SCLR
              >
          : never;
      }[keyof SRC] & {
        [P in keyof Omit<
          Pick<
            SRC,
            {
              [P in keyof DST]: SRC[P] extends "__union" & infer R ? never : P;
            }[keyof DST]
          >,
          "__typename"
        >]: IsPayLoad<DST[P]> extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      }
    : {
        [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<
          DST[P]
        > extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> =
  SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST, SCLR> : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> =
  IsPayLoad<DST> extends { __alias: infer R }
    ? {
        [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<
          SRC,
          R[P],
          SCLR
        >];
      } & MapType<SRC, Omit<IsPayLoad<DST>, "__alias">, SCLR>
    : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (
    fn: (e: {
      data?: InputType<T, Z, SCLR>;
      code?: number;
      reason?: string;
      message?: string;
    }) => void,
  ) => void;
  error: (
    fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void,
  ) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<
  SELECTOR,
  NAME extends keyof GraphQLTypes,
  SCLR extends ScalarDefinition = {},
> = InputType<GraphQLTypes[NAME], SELECTOR, SCLR>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ["String"]: string;
  ["Int"]: number;
  ["Float"]: number;
  ["ID"]: unknown;
  ["Boolean"]: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> =
  | `${T}!`
  | T
  | `[${T}]`
  | `[${T}]!`
  | `[${T}!]`
  | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> =
  T extends VR<infer R1>
    ? R1 extends VR<infer R2>
      ? R2 extends VR<infer R3>
        ? R3 extends VR<infer R4>
          ? R4 extends VR<infer R5>
            ? R5
            : R4
          : R3
        : R2
      : R1
    : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
    ? NonNullable<DecomposeType<R, Type>>
    : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> =
  T extends keyof ZEUS_VARIABLES
    ? ZEUS_VARIABLES[T]
    : T extends keyof BuiltInVariableTypes
      ? BuiltInVariableTypes[T]
      : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> &
  WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  " __zeus_name": Name;
  " __zeus_type": T;
};

export type ExtractVariablesDeep<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends string | number | boolean | Array<string | number | boolean>
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      : UnionToIntersection<
          {
            [K in keyof Query]: WithOptionalNullables<
              ExtractVariablesDeep<Query[K]>
            >;
          }[keyof Query]
        >;

export type ExtractVariables<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends [infer Inputs, infer Outputs]
      ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
      : Query extends
            | string
            | number
            | boolean
            | Array<string | number | boolean>
        ? // eslint-disable-next-line @typescript-eslint/ban-types
          {}
        : UnionToIntersection<
            {
              [K in keyof Query]: WithOptionalNullables<
                ExtractVariables<Query[K]>
              >;
            }[keyof Query]
          >;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(
  name: Name,
  graphqlType: Type,
) => {
  return (START_VAR_NAME +
    name +
    GRAPHQL_TYPE_SEPARATOR +
    graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never;
export type ScalarCoders = {
  Boolean?: ScalarResolver;
  Date?: ScalarResolver;
  Float?: ScalarResolver;
  GraphQLStringOrFloat?: ScalarResolver;
  ID?: ScalarResolver;
  Int?: ScalarResolver;
  JSON?: ScalarResolver;
  String?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  ["Query"]: AliasType<{
    Tagi?: [
      {
        filter?:
          | ValueTypes["Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Tagi"],
    ];
    Tagi_by_id?: [{ id: string | Variable<any, string> }, ValueTypes["Tagi"]];
    Tagi_aggregated?: [
      {
        groupBy?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        filter?:
          | ValueTypes["Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Tagi_aggregated"],
    ];
    Tagi_by_version?: [
      {
        version: string | Variable<any, string>;
        id: string | Variable<any, string>;
      },
      ValueTypes["version_Tagi"],
    ];
    Organizacje_Tagi?: [
      {
        filter?:
          | ValueTypes["Organizacje_Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje_Tagi"],
    ];
    Organizacje_Tagi_by_id?: [
      { id: string | Variable<any, string> },
      ValueTypes["Organizacje_Tagi"],
    ];
    Organizacje_Tagi_aggregated?: [
      {
        groupBy?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        filter?:
          | ValueTypes["Organizacje_Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_Tagi_aggregated"],
    ];
    Organizacje_Tagi_by_version?: [
      {
        version: string | Variable<any, string>;
        id: string | Variable<any, string>;
      },
      ValueTypes["version_Organizacje_Tagi"],
    ];
    Organizacje?: [
      {
        filter?:
          | ValueTypes["Organizacje_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje"],
    ];
    Organizacje_by_id?: [
      { id: string | Variable<any, string> },
      ValueTypes["Organizacje"],
    ];
    Organizacje_aggregated?: [
      {
        groupBy?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        filter?:
          | ValueTypes["Organizacje_filter"]
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_aggregated"],
    ];
    Organizacje_by_version?: [
      {
        version: string | Variable<any, string>;
        id: string | Variable<any, string>;
      },
      ValueTypes["version_Organizacje"],
    ];
    Organizacje_files?: [
      {
        filter?:
          | ValueTypes["Organizacje_files_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje_files"],
    ];
    Organizacje_files_by_id?: [
      { id: string | Variable<any, string> },
      ValueTypes["Organizacje_files"],
    ];
    Organizacje_files_aggregated?: [
      {
        groupBy?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        filter?:
          | ValueTypes["Organizacje_files_filter"]
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_files_aggregated"],
    ];
    Organizacje_files_by_version?: [
      {
        version: string | Variable<any, string>;
        id: string | Variable<any, string>;
      },
      ValueTypes["version_Organizacje_files"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["Subscription"]: AliasType<{
    Tagi_mutated?: [
      {
        event?:
          | ValueTypes["EventEnum"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Tagi_mutated"],
    ];
    Organizacje_Tagi_mutated?: [
      {
        event?:
          | ValueTypes["EventEnum"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_Tagi_mutated"],
    ];
    Organizacje_mutated?: [
      {
        event?:
          | ValueTypes["EventEnum"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_mutated"],
    ];
    Organizacje_files_mutated?: [
      {
        event?:
          | ValueTypes["EventEnum"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["Organizacje_files_mutated"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** The `Boolean` scalar type represents `true` or `false`. */
  ["Boolean"]: unknown;
  /** ISO8601 Date values */
  ["Date"]: unknown;
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  ["Float"]: unknown;
  /** A Float or a String */
  ["GraphQLStringOrFloat"]: unknown;
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ["ID"]: unknown;
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  ["Int"]: unknown;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  ["JSON"]: unknown;
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  ["String"]: unknown;
  ["EventEnum"]: EventEnum;
  ["count_functions"]: AliasType<{
    count?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["datetime_functions"]: AliasType<{
    year?: boolean | `@${string}`;
    month?: boolean | `@${string}`;
    week?: boolean | `@${string}`;
    day?: boolean | `@${string}`;
    weekday?: boolean | `@${string}`;
    hour?: boolean | `@${string}`;
    minute?: boolean | `@${string}`;
    second?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ValueTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ValueTypes["datetime_functions"];
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: [
      {
        filter?:
          | ValueTypes["Organizacje_Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje_Tagi"],
    ];
    tags_func?: ValueTypes["count_functions"];
    images?: [
      {
        filter?:
          | ValueTypes["Organizacje_files_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje_files"],
    ];
    images_func?: ValueTypes["count_functions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ValueTypes["Organizacje_aggregated_count"];
    countDistinct?: ValueTypes["Organizacje_aggregated_count"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: boolean | `@${string}`;
    images?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: [
      {
        filter?:
          | ValueTypes["Organizacje_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje"],
    ];
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ValueTypes["Organizacje_files_aggregated_count"];
    countDistinct?: ValueTypes["Organizacje_files_aggregated_count"];
    avg?: ValueTypes["Organizacje_files_aggregated_fields"];
    sum?: ValueTypes["Organizacje_files_aggregated_fields"];
    avgDistinct?: ValueTypes["Organizacje_files_aggregated_fields"];
    sumDistinct?: ValueTypes["Organizacje_files_aggregated_fields"];
    min?: ValueTypes["Organizacje_files_aggregated_fields"];
    max?: ValueTypes["Organizacje_files_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ValueTypes["Organizacje_files"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ValueTypes["Organizacje"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: [
      {
        filter?:
          | ValueTypes["Organizacje_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Organizacje"],
    ];
    Tagi_id?: [
      {
        filter?:
          | ValueTypes["Tagi_filter"]
          | undefined
          | null
          | Variable<any, string>;
        sort?:
          | Array<string | undefined | null>
          | undefined
          | null
          | Variable<any, string>;
        limit?: number | undefined | null | Variable<any, string>;
        offset?: number | undefined | null | Variable<any, string>;
        page?: number | undefined | null | Variable<any, string>;
        search?: string | undefined | null | Variable<any, string>;
      },
      ValueTypes["Tagi"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ValueTypes["Organizacje_Tagi_aggregated_count"];
    countDistinct?: ValueTypes["Organizacje_Tagi_aggregated_count"];
    avg?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    sum?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    avgDistinct?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    sumDistinct?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    min?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    max?: ValueTypes["Organizacje_Tagi_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ValueTypes["Organizacje_Tagi"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ValueTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ValueTypes["datetime_functions"];
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ValueTypes["Tagi_aggregated_count"];
    countDistinct?: ValueTypes["Tagi_aggregated_count"];
    avg?: ValueTypes["Tagi_aggregated_fields"];
    sum?: ValueTypes["Tagi_aggregated_fields"];
    avgDistinct?: ValueTypes["Tagi_aggregated_fields"];
    sumDistinct?: ValueTypes["Tagi_aggregated_fields"];
    min?: ValueTypes["Tagi_aggregated_fields"];
    max?: ValueTypes["Tagi_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ValueTypes["Tagi"];
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ValueTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ValueTypes["datetime_functions"];
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: boolean | `@${string}`;
    tags_func?: ValueTypes["count_functions"];
    images?: boolean | `@${string}`;
    images_func?: ValueTypes["count_functions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje_files"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ValueTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ValueTypes["datetime_functions"];
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["count_function_filter_operators"]: {
    count?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["date_filter_operators"]: {
    _eq?: string | undefined | null | Variable<any, string>;
    _neq?: string | undefined | null | Variable<any, string>;
    _gt?: string | undefined | null | Variable<any, string>;
    _gte?: string | undefined | null | Variable<any, string>;
    _lt?: string | undefined | null | Variable<any, string>;
    _lte?: string | undefined | null | Variable<any, string>;
    _null?: boolean | undefined | null | Variable<any, string>;
    _nnull?: boolean | undefined | null | Variable<any, string>;
    _in?:
      | Array<string | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _nin?:
      | Array<string | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _between?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _nbetween?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["datetime_function_filter_operators"]: {
    year?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    month?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    week?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    day?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    weekday?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    hour?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    minute?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    second?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["number_filter_operators"]: {
    _eq?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _neq?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _in?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _gt?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _gte?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _lt?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _lte?:
      | ValueTypes["GraphQLStringOrFloat"]
      | undefined
      | null
      | Variable<any, string>;
    _null?: boolean | undefined | null | Variable<any, string>;
    _nnull?: boolean | undefined | null | Variable<any, string>;
    _between?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _nbetween?:
      | Array<ValueTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["Organizacje_files_filter"]: {
    id?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    Organizacje_id?:
      | ValueTypes["Organizacje_filter"]
      | undefined
      | null
      | Variable<any, string>;
    directus_files_id?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    _and?:
      | Array<ValueTypes["Organizacje_files_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["Organizacje_files_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["Organizacje_filter"]: {
    id?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    status?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    user_created?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_created?:
      | ValueTypes["date_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_created_func?:
      | ValueTypes["datetime_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    user_updated?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_updated?:
      | ValueTypes["date_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_updated_func?:
      | ValueTypes["datetime_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    email?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    field?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    longDescription?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    skillsAndChallenges?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    website?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    linkedin?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    facebook?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    instagram?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    youtube?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    slug?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    name?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    logo?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    shortDescription?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    achievements?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    distinguishingFeatures?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    areasOfInterest?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    tags?:
      | ValueTypes["Organizacje_Tagi_filter"]
      | undefined
      | null
      | Variable<any, string>;
    tags_func?:
      | ValueTypes["count_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    images?:
      | ValueTypes["Organizacje_files_filter"]
      | undefined
      | null
      | Variable<any, string>;
    images_func?:
      | ValueTypes["count_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    _and?:
      | Array<ValueTypes["Organizacje_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["Organizacje_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["Organizacje_Tagi_filter"]: {
    id?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    Organizacje_id?:
      | ValueTypes["Organizacje_filter"]
      | undefined
      | null
      | Variable<any, string>;
    Tagi_id?:
      | ValueTypes["Tagi_filter"]
      | undefined
      | null
      | Variable<any, string>;
    _and?:
      | Array<ValueTypes["Organizacje_Tagi_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["Organizacje_Tagi_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["string_filter_operators"]: {
    _eq?: string | undefined | null | Variable<any, string>;
    _neq?: string | undefined | null | Variable<any, string>;
    _contains?: string | undefined | null | Variable<any, string>;
    _icontains?: string | undefined | null | Variable<any, string>;
    _ncontains?: string | undefined | null | Variable<any, string>;
    _starts_with?: string | undefined | null | Variable<any, string>;
    _nstarts_with?: string | undefined | null | Variable<any, string>;
    _istarts_with?: string | undefined | null | Variable<any, string>;
    _nistarts_with?: string | undefined | null | Variable<any, string>;
    _ends_with?: string | undefined | null | Variable<any, string>;
    _nends_with?: string | undefined | null | Variable<any, string>;
    _iends_with?: string | undefined | null | Variable<any, string>;
    _niends_with?: string | undefined | null | Variable<any, string>;
    _in?:
      | Array<string | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _nin?:
      | Array<string | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _null?: boolean | undefined | null | Variable<any, string>;
    _nnull?: boolean | undefined | null | Variable<any, string>;
    _empty?: boolean | undefined | null | Variable<any, string>;
    _nempty?: boolean | undefined | null | Variable<any, string>;
  };
  ["Tagi_filter"]: {
    id?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    sort?:
      | ValueTypes["number_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    user_created?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_created?:
      | ValueTypes["date_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_created_func?:
      | ValueTypes["datetime_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    user_updated?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_updated?:
      | ValueTypes["date_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    date_updated_func?:
      | ValueTypes["datetime_function_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    tag?:
      | ValueTypes["string_filter_operators"]
      | undefined
      | null
      | Variable<any, string>;
    _and?:
      | Array<ValueTypes["Tagi_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["Tagi_filter"] | undefined | null>
      | undefined
      | null
      | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  ["Query"]: AliasType<{
    Tagi?: [
      {
        filter?: ResolverInputTypes["Tagi_filter"] | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Tagi"],
    ];
    Tagi_by_id?: [{ id: string }, ResolverInputTypes["Tagi"]];
    Tagi_aggregated?: [
      {
        groupBy?: Array<string | undefined | null> | undefined | null;
        filter?: ResolverInputTypes["Tagi_filter"] | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
      },
      ResolverInputTypes["Tagi_aggregated"],
    ];
    Tagi_by_version?: [
      { version: string; id: string },
      ResolverInputTypes["version_Tagi"],
    ];
    Organizacje_Tagi?: [
      {
        filter?:
          | ResolverInputTypes["Organizacje_Tagi_filter"]
          | undefined
          | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje_Tagi"],
    ];
    Organizacje_Tagi_by_id?: [
      { id: string },
      ResolverInputTypes["Organizacje_Tagi"],
    ];
    Organizacje_Tagi_aggregated?: [
      {
        groupBy?: Array<string | undefined | null> | undefined | null;
        filter?:
          | ResolverInputTypes["Organizacje_Tagi_filter"]
          | undefined
          | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
      },
      ResolverInputTypes["Organizacje_Tagi_aggregated"],
    ];
    Organizacje_Tagi_by_version?: [
      { version: string; id: string },
      ResolverInputTypes["version_Organizacje_Tagi"],
    ];
    Organizacje?: [
      {
        filter?: ResolverInputTypes["Organizacje_filter"] | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje"],
    ];
    Organizacje_by_id?: [{ id: string }, ResolverInputTypes["Organizacje"]];
    Organizacje_aggregated?: [
      {
        groupBy?: Array<string | undefined | null> | undefined | null;
        filter?: ResolverInputTypes["Organizacje_filter"] | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
      },
      ResolverInputTypes["Organizacje_aggregated"],
    ];
    Organizacje_by_version?: [
      { version: string; id: string },
      ResolverInputTypes["version_Organizacje"],
    ];
    Organizacje_files?: [
      {
        filter?:
          | ResolverInputTypes["Organizacje_files_filter"]
          | undefined
          | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje_files"],
    ];
    Organizacje_files_by_id?: [
      { id: string },
      ResolverInputTypes["Organizacje_files"],
    ];
    Organizacje_files_aggregated?: [
      {
        groupBy?: Array<string | undefined | null> | undefined | null;
        filter?:
          | ResolverInputTypes["Organizacje_files_filter"]
          | undefined
          | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
      },
      ResolverInputTypes["Organizacje_files_aggregated"],
    ];
    Organizacje_files_by_version?: [
      { version: string; id: string },
      ResolverInputTypes["version_Organizacje_files"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["Subscription"]: AliasType<{
    Tagi_mutated?: [
      { event?: ResolverInputTypes["EventEnum"] | undefined | null },
      ResolverInputTypes["Tagi_mutated"],
    ];
    Organizacje_Tagi_mutated?: [
      { event?: ResolverInputTypes["EventEnum"] | undefined | null },
      ResolverInputTypes["Organizacje_Tagi_mutated"],
    ];
    Organizacje_mutated?: [
      { event?: ResolverInputTypes["EventEnum"] | undefined | null },
      ResolverInputTypes["Organizacje_mutated"],
    ];
    Organizacje_files_mutated?: [
      { event?: ResolverInputTypes["EventEnum"] | undefined | null },
      ResolverInputTypes["Organizacje_files_mutated"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** The `Boolean` scalar type represents `true` or `false`. */
  ["Boolean"]: unknown;
  /** ISO8601 Date values */
  ["Date"]: unknown;
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  ["Float"]: unknown;
  /** A Float or a String */
  ["GraphQLStringOrFloat"]: unknown;
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ["ID"]: unknown;
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  ["Int"]: unknown;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  ["JSON"]: unknown;
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  ["String"]: unknown;
  ["EventEnum"]: EventEnum;
  ["count_functions"]: AliasType<{
    count?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["datetime_functions"]: AliasType<{
    year?: boolean | `@${string}`;
    month?: boolean | `@${string}`;
    week?: boolean | `@${string}`;
    day?: boolean | `@${string}`;
    weekday?: boolean | `@${string}`;
    hour?: boolean | `@${string}`;
    minute?: boolean | `@${string}`;
    second?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ResolverInputTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ResolverInputTypes["datetime_functions"];
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: [
      {
        filter?:
          | ResolverInputTypes["Organizacje_Tagi_filter"]
          | undefined
          | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje_Tagi"],
    ];
    tags_func?: ResolverInputTypes["count_functions"];
    images?: [
      {
        filter?:
          | ResolverInputTypes["Organizacje_files_filter"]
          | undefined
          | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje_files"],
    ];
    images_func?: ResolverInputTypes["count_functions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ResolverInputTypes["Organizacje_aggregated_count"];
    countDistinct?: ResolverInputTypes["Organizacje_aggregated_count"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: boolean | `@${string}`;
    images?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: [
      {
        filter?: ResolverInputTypes["Organizacje_filter"] | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje"],
    ];
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ResolverInputTypes["Organizacje_files_aggregated_count"];
    countDistinct?: ResolverInputTypes["Organizacje_files_aggregated_count"];
    avg?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    sum?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    avgDistinct?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    sumDistinct?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    min?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    max?: ResolverInputTypes["Organizacje_files_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_files_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ResolverInputTypes["Organizacje_files"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ResolverInputTypes["Organizacje"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: [
      {
        filter?: ResolverInputTypes["Organizacje_filter"] | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Organizacje"],
    ];
    Tagi_id?: [
      {
        filter?: ResolverInputTypes["Tagi_filter"] | undefined | null;
        sort?: Array<string | undefined | null> | undefined | null;
        limit?: number | undefined | null;
        offset?: number | undefined | null;
        page?: number | undefined | null;
        search?: string | undefined | null;
      },
      ResolverInputTypes["Tagi"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ResolverInputTypes["Organizacje_Tagi_aggregated_count"];
    countDistinct?: ResolverInputTypes["Organizacje_Tagi_aggregated_count"];
    avg?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    sum?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    avgDistinct?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    sumDistinct?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    min?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    max?: ResolverInputTypes["Organizacje_Tagi_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Organizacje_Tagi_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ResolverInputTypes["Organizacje_Tagi"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ResolverInputTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ResolverInputTypes["datetime_functions"];
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated"]: AliasType<{
    group?: boolean | `@${string}`;
    countAll?: boolean | `@${string}`;
    count?: ResolverInputTypes["Tagi_aggregated_count"];
    countDistinct?: ResolverInputTypes["Tagi_aggregated_count"];
    avg?: ResolverInputTypes["Tagi_aggregated_fields"];
    sum?: ResolverInputTypes["Tagi_aggregated_fields"];
    avgDistinct?: ResolverInputTypes["Tagi_aggregated_fields"];
    sumDistinct?: ResolverInputTypes["Tagi_aggregated_fields"];
    min?: ResolverInputTypes["Tagi_aggregated_fields"];
    max?: ResolverInputTypes["Tagi_aggregated_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated_count"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_aggregated_fields"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["Tagi_mutated"]: AliasType<{
    key?: boolean | `@${string}`;
    event?: boolean | `@${string}`;
    data?: ResolverInputTypes["Tagi"];
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje"]: AliasType<{
    id?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ResolverInputTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ResolverInputTypes["datetime_functions"];
    email?: boolean | `@${string}`;
    field?: boolean | `@${string}`;
    longDescription?: boolean | `@${string}`;
    skillsAndChallenges?: boolean | `@${string}`;
    website?: boolean | `@${string}`;
    linkedin?: boolean | `@${string}`;
    facebook?: boolean | `@${string}`;
    instagram?: boolean | `@${string}`;
    youtube?: boolean | `@${string}`;
    slug?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    logo?: boolean | `@${string}`;
    shortDescription?: boolean | `@${string}`;
    achievements?: boolean | `@${string}`;
    distinguishingFeatures?: boolean | `@${string}`;
    areasOfInterest?: boolean | `@${string}`;
    tags?: boolean | `@${string}`;
    tags_func?: ResolverInputTypes["count_functions"];
    images?: boolean | `@${string}`;
    images_func?: ResolverInputTypes["count_functions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje_files"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    directus_files_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Organizacje_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    Organizacje_id?: boolean | `@${string}`;
    Tagi_id?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["version_Tagi"]: AliasType<{
    id?: boolean | `@${string}`;
    sort?: boolean | `@${string}`;
    user_created?: boolean | `@${string}`;
    date_created?: boolean | `@${string}`;
    date_created_func?: ResolverInputTypes["datetime_functions"];
    user_updated?: boolean | `@${string}`;
    date_updated?: boolean | `@${string}`;
    date_updated_func?: ResolverInputTypes["datetime_functions"];
    tag?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["count_function_filter_operators"]: {
    count?: ResolverInputTypes["number_filter_operators"] | undefined | null;
  };
  ["date_filter_operators"]: {
    _eq?: string | undefined | null;
    _neq?: string | undefined | null;
    _gt?: string | undefined | null;
    _gte?: string | undefined | null;
    _lt?: string | undefined | null;
    _lte?: string | undefined | null;
    _null?: boolean | undefined | null;
    _nnull?: boolean | undefined | null;
    _in?: Array<string | undefined | null> | undefined | null;
    _nin?: Array<string | undefined | null> | undefined | null;
    _between?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
    _nbetween?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
  };
  ["datetime_function_filter_operators"]: {
    year?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    month?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    week?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    day?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    weekday?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    hour?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    minute?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    second?: ResolverInputTypes["number_filter_operators"] | undefined | null;
  };
  ["number_filter_operators"]: {
    _eq?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _neq?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _in?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
    _nin?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
    _gt?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _gte?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _lt?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _lte?: ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null;
    _null?: boolean | undefined | null;
    _nnull?: boolean | undefined | null;
    _between?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
    _nbetween?:
      | Array<ResolverInputTypes["GraphQLStringOrFloat"] | undefined | null>
      | undefined
      | null;
  };
  ["Organizacje_files_filter"]: {
    id?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    Organizacje_id?:
      | ResolverInputTypes["Organizacje_filter"]
      | undefined
      | null;
    directus_files_id?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    _and?:
      | Array<ResolverInputTypes["Organizacje_files_filter"] | undefined | null>
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["Organizacje_files_filter"] | undefined | null>
      | undefined
      | null;
  };
  ["Organizacje_filter"]: {
    id?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    status?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    user_created?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    date_created?:
      | ResolverInputTypes["date_filter_operators"]
      | undefined
      | null;
    date_created_func?:
      | ResolverInputTypes["datetime_function_filter_operators"]
      | undefined
      | null;
    user_updated?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    date_updated?:
      | ResolverInputTypes["date_filter_operators"]
      | undefined
      | null;
    date_updated_func?:
      | ResolverInputTypes["datetime_function_filter_operators"]
      | undefined
      | null;
    email?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    field?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    longDescription?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    skillsAndChallenges?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    website?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    linkedin?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    facebook?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    instagram?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    youtube?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    slug?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    name?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    logo?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    shortDescription?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    achievements?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    distinguishingFeatures?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    areasOfInterest?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    tags?: ResolverInputTypes["Organizacje_Tagi_filter"] | undefined | null;
    tags_func?:
      | ResolverInputTypes["count_function_filter_operators"]
      | undefined
      | null;
    images?: ResolverInputTypes["Organizacje_files_filter"] | undefined | null;
    images_func?:
      | ResolverInputTypes["count_function_filter_operators"]
      | undefined
      | null;
    _and?:
      | Array<ResolverInputTypes["Organizacje_filter"] | undefined | null>
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["Organizacje_filter"] | undefined | null>
      | undefined
      | null;
  };
  ["Organizacje_Tagi_filter"]: {
    id?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    Organizacje_id?:
      | ResolverInputTypes["Organizacje_filter"]
      | undefined
      | null;
    Tagi_id?: ResolverInputTypes["Tagi_filter"] | undefined | null;
    _and?:
      | Array<ResolverInputTypes["Organizacje_Tagi_filter"] | undefined | null>
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["Organizacje_Tagi_filter"] | undefined | null>
      | undefined
      | null;
  };
  ["string_filter_operators"]: {
    _eq?: string | undefined | null;
    _neq?: string | undefined | null;
    _contains?: string | undefined | null;
    _icontains?: string | undefined | null;
    _ncontains?: string | undefined | null;
    _starts_with?: string | undefined | null;
    _nstarts_with?: string | undefined | null;
    _istarts_with?: string | undefined | null;
    _nistarts_with?: string | undefined | null;
    _ends_with?: string | undefined | null;
    _nends_with?: string | undefined | null;
    _iends_with?: string | undefined | null;
    _niends_with?: string | undefined | null;
    _in?: Array<string | undefined | null> | undefined | null;
    _nin?: Array<string | undefined | null> | undefined | null;
    _null?: boolean | undefined | null;
    _nnull?: boolean | undefined | null;
    _empty?: boolean | undefined | null;
    _nempty?: boolean | undefined | null;
  };
  ["Tagi_filter"]: {
    id?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    sort?: ResolverInputTypes["number_filter_operators"] | undefined | null;
    user_created?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    date_created?:
      | ResolverInputTypes["date_filter_operators"]
      | undefined
      | null;
    date_created_func?:
      | ResolverInputTypes["datetime_function_filter_operators"]
      | undefined
      | null;
    user_updated?:
      | ResolverInputTypes["string_filter_operators"]
      | undefined
      | null;
    date_updated?:
      | ResolverInputTypes["date_filter_operators"]
      | undefined
      | null;
    date_updated_func?:
      | ResolverInputTypes["datetime_function_filter_operators"]
      | undefined
      | null;
    tag?: ResolverInputTypes["string_filter_operators"] | undefined | null;
    _and?:
      | Array<ResolverInputTypes["Tagi_filter"] | undefined | null>
      | undefined
      | null;
    _or?:
      | Array<ResolverInputTypes["Tagi_filter"] | undefined | null>
      | undefined
      | null;
  };
  ["schema"]: AliasType<{
    query?: ResolverInputTypes["Query"];
    subscription?: ResolverInputTypes["Subscription"];
    __typename?: boolean | `@${string}`;
  }>;
};

export type ModelTypes = {
  ["Query"]: {
    Tagi: Array<ModelTypes["Tagi"]>;
    Tagi_by_id?: ModelTypes["Tagi"] | undefined;
    Tagi_aggregated: Array<ModelTypes["Tagi_aggregated"]>;
    Tagi_by_version?: ModelTypes["version_Tagi"] | undefined;
    Organizacje_Tagi: Array<ModelTypes["Organizacje_Tagi"]>;
    Organizacje_Tagi_by_id?: ModelTypes["Organizacje_Tagi"] | undefined;
    Organizacje_Tagi_aggregated: Array<
      ModelTypes["Organizacje_Tagi_aggregated"]
    >;
    Organizacje_Tagi_by_version?:
      | ModelTypes["version_Organizacje_Tagi"]
      | undefined;
    Organizacje: Array<ModelTypes["Organizacje"]>;
    Organizacje_by_id?: ModelTypes["Organizacje"] | undefined;
    Organizacje_aggregated: Array<ModelTypes["Organizacje_aggregated"]>;
    Organizacje_by_version?: ModelTypes["version_Organizacje"] | undefined;
    Organizacje_files: Array<ModelTypes["Organizacje_files"]>;
    Organizacje_files_by_id?: ModelTypes["Organizacje_files"] | undefined;
    Organizacje_files_aggregated: Array<
      ModelTypes["Organizacje_files_aggregated"]
    >;
    Organizacje_files_by_version?:
      | ModelTypes["version_Organizacje_files"]
      | undefined;
  };
  ["Subscription"]: {
    Tagi_mutated?: ModelTypes["Tagi_mutated"] | undefined;
    Organizacje_Tagi_mutated?:
      | ModelTypes["Organizacje_Tagi_mutated"]
      | undefined;
    Organizacje_mutated?: ModelTypes["Organizacje_mutated"] | undefined;
    Organizacje_files_mutated?:
      | ModelTypes["Organizacje_files_mutated"]
      | undefined;
  };
  /** The `Boolean` scalar type represents `true` or `false`. */
  ["Boolean"]: any;
  /** ISO8601 Date values */
  ["Date"]: any;
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  ["Float"]: any;
  /** A Float or a String */
  ["GraphQLStringOrFloat"]: any;
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ["ID"]: any;
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  ["Int"]: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  ["JSON"]: any;
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  ["String"]: any;
  ["EventEnum"]: EventEnum;
  ["count_functions"]: {
    count?: number | undefined;
  };
  ["datetime_functions"]: {
    year?: number | undefined;
    month?: number | undefined;
    week?: number | undefined;
    day?: number | undefined;
    weekday?: number | undefined;
    hour?: number | undefined;
    minute?: number | undefined;
    second?: number | undefined;
  };
  ["Organizacje"]: {
    id: string;
    status?: string | undefined;
    user_created?: string | undefined;
    date_created?: ModelTypes["Date"] | undefined;
    date_created_func?: ModelTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: ModelTypes["Date"] | undefined;
    date_updated_func?: ModelTypes["datetime_functions"] | undefined;
    email?: string | undefined;
    field?: string | undefined;
    longDescription?: string | undefined;
    skillsAndChallenges?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
    slug: string;
    name: string;
    logo?: string | undefined;
    shortDescription?: string | undefined;
    achievements?: string | undefined;
    distinguishingFeatures?: string | undefined;
    areasOfInterest?: string | undefined;
    tags?: Array<ModelTypes["Organizacje_Tagi"] | undefined> | undefined;
    tags_func?: ModelTypes["count_functions"] | undefined;
    images?: Array<ModelTypes["Organizacje_files"] | undefined> | undefined;
    images_func?: ModelTypes["count_functions"] | undefined;
  };
  ["Organizacje_aggregated"]: {
    group?: ModelTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: ModelTypes["Organizacje_aggregated_count"] | undefined;
    countDistinct?: ModelTypes["Organizacje_aggregated_count"] | undefined;
  };
  ["Organizacje_aggregated_count"]: {
    id?: number | undefined;
    status?: number | undefined;
    user_created?: number | undefined;
    date_created?: number | undefined;
    user_updated?: number | undefined;
    date_updated?: number | undefined;
    email?: number | undefined;
    field?: number | undefined;
    longDescription?: number | undefined;
    skillsAndChallenges?: number | undefined;
    website?: number | undefined;
    linkedin?: number | undefined;
    facebook?: number | undefined;
    instagram?: number | undefined;
    youtube?: number | undefined;
    slug?: number | undefined;
    name?: number | undefined;
    logo?: number | undefined;
    shortDescription?: number | undefined;
    achievements?: number | undefined;
    distinguishingFeatures?: number | undefined;
    areasOfInterest?: number | undefined;
    tags?: number | undefined;
    images?: number | undefined;
  };
  ["Organizacje_files"]: {
    id: string;
    Organizacje_id?: ModelTypes["Organizacje"] | undefined;
    directus_files_id?: string | undefined;
  };
  ["Organizacje_files_aggregated"]: {
    group?: ModelTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: ModelTypes["Organizacje_files_aggregated_count"] | undefined;
    countDistinct?:
      | ModelTypes["Organizacje_files_aggregated_count"]
      | undefined;
    avg?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
    sum?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
    avgDistinct?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
    sumDistinct?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
    min?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
    max?: ModelTypes["Organizacje_files_aggregated_fields"] | undefined;
  };
  ["Organizacje_files_aggregated_count"]: {
    id?: number | undefined;
    Organizacje_id?: number | undefined;
    directus_files_id?: number | undefined;
  };
  ["Organizacje_files_aggregated_fields"]: {
    id?: number | undefined;
  };
  ["Organizacje_files_mutated"]: {
    key: string;
    event?: ModelTypes["EventEnum"] | undefined;
    data?: ModelTypes["Organizacje_files"] | undefined;
  };
  ["Organizacje_mutated"]: {
    key: string;
    event?: ModelTypes["EventEnum"] | undefined;
    data?: ModelTypes["Organizacje"] | undefined;
  };
  ["Organizacje_Tagi"]: {
    id: string;
    Organizacje_id?: ModelTypes["Organizacje"] | undefined;
    Tagi_id?: ModelTypes["Tagi"] | undefined;
  };
  ["Organizacje_Tagi_aggregated"]: {
    group?: ModelTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: ModelTypes["Organizacje_Tagi_aggregated_count"] | undefined;
    countDistinct?: ModelTypes["Organizacje_Tagi_aggregated_count"] | undefined;
    avg?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    sum?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    avgDistinct?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    sumDistinct?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    min?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    max?: ModelTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
  };
  ["Organizacje_Tagi_aggregated_count"]: {
    id?: number | undefined;
    Organizacje_id?: number | undefined;
    Tagi_id?: number | undefined;
  };
  ["Organizacje_Tagi_aggregated_fields"]: {
    id?: number | undefined;
    Tagi_id?: number | undefined;
  };
  ["Organizacje_Tagi_mutated"]: {
    key: string;
    event?: ModelTypes["EventEnum"] | undefined;
    data?: ModelTypes["Organizacje_Tagi"] | undefined;
  };
  ["Tagi"]: {
    id: string;
    sort?: number | undefined;
    user_created?: string | undefined;
    date_created?: ModelTypes["Date"] | undefined;
    date_created_func?: ModelTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: ModelTypes["Date"] | undefined;
    date_updated_func?: ModelTypes["datetime_functions"] | undefined;
    tag: string;
  };
  ["Tagi_aggregated"]: {
    group?: ModelTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: ModelTypes["Tagi_aggregated_count"] | undefined;
    countDistinct?: ModelTypes["Tagi_aggregated_count"] | undefined;
    avg?: ModelTypes["Tagi_aggregated_fields"] | undefined;
    sum?: ModelTypes["Tagi_aggregated_fields"] | undefined;
    avgDistinct?: ModelTypes["Tagi_aggregated_fields"] | undefined;
    sumDistinct?: ModelTypes["Tagi_aggregated_fields"] | undefined;
    min?: ModelTypes["Tagi_aggregated_fields"] | undefined;
    max?: ModelTypes["Tagi_aggregated_fields"] | undefined;
  };
  ["Tagi_aggregated_count"]: {
    id?: number | undefined;
    sort?: number | undefined;
    user_created?: number | undefined;
    date_created?: number | undefined;
    user_updated?: number | undefined;
    date_updated?: number | undefined;
    tag?: number | undefined;
  };
  ["Tagi_aggregated_fields"]: {
    id?: number | undefined;
    sort?: number | undefined;
  };
  ["Tagi_mutated"]: {
    key: string;
    event?: ModelTypes["EventEnum"] | undefined;
    data?: ModelTypes["Tagi"] | undefined;
  };
  ["version_Organizacje"]: {
    id: string;
    status?: string | undefined;
    user_created?: string | undefined;
    date_created?: ModelTypes["Date"] | undefined;
    date_created_func?: ModelTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: ModelTypes["Date"] | undefined;
    date_updated_func?: ModelTypes["datetime_functions"] | undefined;
    email?: string | undefined;
    field?: string | undefined;
    longDescription?: string | undefined;
    skillsAndChallenges?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
    slug: string;
    name: string;
    logo?: string | undefined;
    shortDescription?: string | undefined;
    achievements?: string | undefined;
    distinguishingFeatures?: string | undefined;
    areasOfInterest?: string | undefined;
    tags?: ModelTypes["JSON"] | undefined;
    tags_func?: ModelTypes["count_functions"] | undefined;
    images?: ModelTypes["JSON"] | undefined;
    images_func?: ModelTypes["count_functions"] | undefined;
  };
  ["version_Organizacje_files"]: {
    id: string;
    Organizacje_id?: string | undefined;
    directus_files_id?: string | undefined;
  };
  ["version_Organizacje_Tagi"]: {
    id: string;
    Organizacje_id?: string | undefined;
    Tagi_id?: number | undefined;
  };
  ["version_Tagi"]: {
    id: string;
    sort?: number | undefined;
    user_created?: string | undefined;
    date_created?: ModelTypes["Date"] | undefined;
    date_created_func?: ModelTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: ModelTypes["Date"] | undefined;
    date_updated_func?: ModelTypes["datetime_functions"] | undefined;
    tag: string;
  };
  ["count_function_filter_operators"]: {
    count?: ModelTypes["number_filter_operators"] | undefined;
  };
  ["date_filter_operators"]: {
    _eq?: string | undefined;
    _neq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _in?: Array<string | undefined> | undefined;
    _nin?: Array<string | undefined> | undefined;
    _between?:
      | Array<ModelTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
    _nbetween?:
      | Array<ModelTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
  };
  ["datetime_function_filter_operators"]: {
    year?: ModelTypes["number_filter_operators"] | undefined;
    month?: ModelTypes["number_filter_operators"] | undefined;
    week?: ModelTypes["number_filter_operators"] | undefined;
    day?: ModelTypes["number_filter_operators"] | undefined;
    weekday?: ModelTypes["number_filter_operators"] | undefined;
    hour?: ModelTypes["number_filter_operators"] | undefined;
    minute?: ModelTypes["number_filter_operators"] | undefined;
    second?: ModelTypes["number_filter_operators"] | undefined;
  };
  ["number_filter_operators"]: {
    _eq?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _neq?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _in?: Array<ModelTypes["GraphQLStringOrFloat"] | undefined> | undefined;
    _nin?: Array<ModelTypes["GraphQLStringOrFloat"] | undefined> | undefined;
    _gt?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _gte?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _lt?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _lte?: ModelTypes["GraphQLStringOrFloat"] | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _between?:
      | Array<ModelTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
    _nbetween?:
      | Array<ModelTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
  };
  ["Organizacje_files_filter"]: {
    id?: ModelTypes["number_filter_operators"] | undefined;
    Organizacje_id?: ModelTypes["Organizacje_filter"] | undefined;
    directus_files_id?: ModelTypes["string_filter_operators"] | undefined;
    _and?:
      | Array<ModelTypes["Organizacje_files_filter"] | undefined>
      | undefined;
    _or?: Array<ModelTypes["Organizacje_files_filter"] | undefined> | undefined;
  };
  ["Organizacje_filter"]: {
    id?: ModelTypes["string_filter_operators"] | undefined;
    status?: ModelTypes["string_filter_operators"] | undefined;
    user_created?: ModelTypes["string_filter_operators"] | undefined;
    date_created?: ModelTypes["date_filter_operators"] | undefined;
    date_created_func?:
      | ModelTypes["datetime_function_filter_operators"]
      | undefined;
    user_updated?: ModelTypes["string_filter_operators"] | undefined;
    date_updated?: ModelTypes["date_filter_operators"] | undefined;
    date_updated_func?:
      | ModelTypes["datetime_function_filter_operators"]
      | undefined;
    email?: ModelTypes["string_filter_operators"] | undefined;
    field?: ModelTypes["string_filter_operators"] | undefined;
    longDescription?: ModelTypes["string_filter_operators"] | undefined;
    skillsAndChallenges?: ModelTypes["string_filter_operators"] | undefined;
    website?: ModelTypes["string_filter_operators"] | undefined;
    linkedin?: ModelTypes["string_filter_operators"] | undefined;
    facebook?: ModelTypes["string_filter_operators"] | undefined;
    instagram?: ModelTypes["string_filter_operators"] | undefined;
    youtube?: ModelTypes["string_filter_operators"] | undefined;
    slug?: ModelTypes["string_filter_operators"] | undefined;
    name?: ModelTypes["string_filter_operators"] | undefined;
    logo?: ModelTypes["string_filter_operators"] | undefined;
    shortDescription?: ModelTypes["string_filter_operators"] | undefined;
    achievements?: ModelTypes["string_filter_operators"] | undefined;
    distinguishingFeatures?: ModelTypes["string_filter_operators"] | undefined;
    areasOfInterest?: ModelTypes["string_filter_operators"] | undefined;
    tags?: ModelTypes["Organizacje_Tagi_filter"] | undefined;
    tags_func?: ModelTypes["count_function_filter_operators"] | undefined;
    images?: ModelTypes["Organizacje_files_filter"] | undefined;
    images_func?: ModelTypes["count_function_filter_operators"] | undefined;
    _and?: Array<ModelTypes["Organizacje_filter"] | undefined> | undefined;
    _or?: Array<ModelTypes["Organizacje_filter"] | undefined> | undefined;
  };
  ["Organizacje_Tagi_filter"]: {
    id?: ModelTypes["number_filter_operators"] | undefined;
    Organizacje_id?: ModelTypes["Organizacje_filter"] | undefined;
    Tagi_id?: ModelTypes["Tagi_filter"] | undefined;
    _and?: Array<ModelTypes["Organizacje_Tagi_filter"] | undefined> | undefined;
    _or?: Array<ModelTypes["Organizacje_Tagi_filter"] | undefined> | undefined;
  };
  ["string_filter_operators"]: {
    _eq?: string | undefined;
    _neq?: string | undefined;
    _contains?: string | undefined;
    _icontains?: string | undefined;
    _ncontains?: string | undefined;
    _starts_with?: string | undefined;
    _nstarts_with?: string | undefined;
    _istarts_with?: string | undefined;
    _nistarts_with?: string | undefined;
    _ends_with?: string | undefined;
    _nends_with?: string | undefined;
    _iends_with?: string | undefined;
    _niends_with?: string | undefined;
    _in?: Array<string | undefined> | undefined;
    _nin?: Array<string | undefined> | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _empty?: boolean | undefined;
    _nempty?: boolean | undefined;
  };
  ["Tagi_filter"]: {
    id?: ModelTypes["number_filter_operators"] | undefined;
    sort?: ModelTypes["number_filter_operators"] | undefined;
    user_created?: ModelTypes["string_filter_operators"] | undefined;
    date_created?: ModelTypes["date_filter_operators"] | undefined;
    date_created_func?:
      | ModelTypes["datetime_function_filter_operators"]
      | undefined;
    user_updated?: ModelTypes["string_filter_operators"] | undefined;
    date_updated?: ModelTypes["date_filter_operators"] | undefined;
    date_updated_func?:
      | ModelTypes["datetime_function_filter_operators"]
      | undefined;
    tag?: ModelTypes["string_filter_operators"] | undefined;
    _and?: Array<ModelTypes["Tagi_filter"] | undefined> | undefined;
    _or?: Array<ModelTypes["Tagi_filter"] | undefined> | undefined;
  };
  ["schema"]: {
    query?: ModelTypes["Query"] | undefined;
    subscription?: ModelTypes["Subscription"] | undefined;
  };
};

export type GraphQLTypes = {
  ["Query"]: {
    __typename: "Query";
    Tagi: Array<GraphQLTypes["Tagi"]>;
    Tagi_by_id?: GraphQLTypes["Tagi"] | undefined;
    Tagi_aggregated: Array<GraphQLTypes["Tagi_aggregated"]>;
    Tagi_by_version?: GraphQLTypes["version_Tagi"] | undefined;
    Organizacje_Tagi: Array<GraphQLTypes["Organizacje_Tagi"]>;
    Organizacje_Tagi_by_id?: GraphQLTypes["Organizacje_Tagi"] | undefined;
    Organizacje_Tagi_aggregated: Array<
      GraphQLTypes["Organizacje_Tagi_aggregated"]
    >;
    Organizacje_Tagi_by_version?:
      | GraphQLTypes["version_Organizacje_Tagi"]
      | undefined;
    Organizacje: Array<GraphQLTypes["Organizacje"]>;
    Organizacje_by_id?: GraphQLTypes["Organizacje"] | undefined;
    Organizacje_aggregated: Array<GraphQLTypes["Organizacje_aggregated"]>;
    Organizacje_by_version?: GraphQLTypes["version_Organizacje"] | undefined;
    Organizacje_files: Array<GraphQLTypes["Organizacje_files"]>;
    Organizacje_files_by_id?: GraphQLTypes["Organizacje_files"] | undefined;
    Organizacje_files_aggregated: Array<
      GraphQLTypes["Organizacje_files_aggregated"]
    >;
    Organizacje_files_by_version?:
      | GraphQLTypes["version_Organizacje_files"]
      | undefined;
  };
  ["Subscription"]: {
    __typename: "Subscription";
    Tagi_mutated?: GraphQLTypes["Tagi_mutated"] | undefined;
    Organizacje_Tagi_mutated?:
      | GraphQLTypes["Organizacje_Tagi_mutated"]
      | undefined;
    Organizacje_mutated?: GraphQLTypes["Organizacje_mutated"] | undefined;
    Organizacje_files_mutated?:
      | GraphQLTypes["Organizacje_files_mutated"]
      | undefined;
  };
  /** The `Boolean` scalar type represents `true` or `false`. */
  ["Boolean"]: "scalar" & { name: "Boolean" };
  /** ISO8601 Date values */
  ["Date"]: "scalar" & { name: "Date" };
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  ["Float"]: "scalar" & { name: "Float" };
  /** A Float or a String */
  ["GraphQLStringOrFloat"]: "scalar" & { name: "GraphQLStringOrFloat" };
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ["ID"]: "scalar" & { name: "ID" };
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  ["Int"]: "scalar" & { name: "Int" };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  ["JSON"]: "scalar" & { name: "JSON" };
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  ["String"]: "scalar" & { name: "String" };
  ["EventEnum"]: EventEnum;
  ["count_functions"]: {
    __typename: "count_functions";
    count?: number | undefined;
  };
  ["datetime_functions"]: {
    __typename: "datetime_functions";
    year?: number | undefined;
    month?: number | undefined;
    week?: number | undefined;
    day?: number | undefined;
    weekday?: number | undefined;
    hour?: number | undefined;
    minute?: number | undefined;
    second?: number | undefined;
  };
  ["Organizacje"]: {
    __typename: "Organizacje";
    id: string;
    status?: string | undefined;
    user_created?: string | undefined;
    date_created?: GraphQLTypes["Date"] | undefined;
    date_created_func?: GraphQLTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: GraphQLTypes["Date"] | undefined;
    date_updated_func?: GraphQLTypes["datetime_functions"] | undefined;
    email?: string | undefined;
    field?: string | undefined;
    longDescription?: string | undefined;
    skillsAndChallenges?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
    slug: string;
    name: string;
    logo?: string | undefined;
    shortDescription?: string | undefined;
    achievements?: string | undefined;
    distinguishingFeatures?: string | undefined;
    areasOfInterest?: string | undefined;
    tags?: Array<GraphQLTypes["Organizacje_Tagi"] | undefined> | undefined;
    tags_func?: GraphQLTypes["count_functions"] | undefined;
    images?: Array<GraphQLTypes["Organizacje_files"] | undefined> | undefined;
    images_func?: GraphQLTypes["count_functions"] | undefined;
  };
  ["Organizacje_aggregated"]: {
    __typename: "Organizacje_aggregated";
    group?: GraphQLTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: GraphQLTypes["Organizacje_aggregated_count"] | undefined;
    countDistinct?: GraphQLTypes["Organizacje_aggregated_count"] | undefined;
  };
  ["Organizacje_aggregated_count"]: {
    __typename: "Organizacje_aggregated_count";
    id?: number | undefined;
    status?: number | undefined;
    user_created?: number | undefined;
    date_created?: number | undefined;
    user_updated?: number | undefined;
    date_updated?: number | undefined;
    email?: number | undefined;
    field?: number | undefined;
    longDescription?: number | undefined;
    skillsAndChallenges?: number | undefined;
    website?: number | undefined;
    linkedin?: number | undefined;
    facebook?: number | undefined;
    instagram?: number | undefined;
    youtube?: number | undefined;
    slug?: number | undefined;
    name?: number | undefined;
    logo?: number | undefined;
    shortDescription?: number | undefined;
    achievements?: number | undefined;
    distinguishingFeatures?: number | undefined;
    areasOfInterest?: number | undefined;
    tags?: number | undefined;
    images?: number | undefined;
  };
  ["Organizacje_files"]: {
    __typename: "Organizacje_files";
    id: string;
    Organizacje_id?: GraphQLTypes["Organizacje"] | undefined;
    directus_files_id?: string | undefined;
  };
  ["Organizacje_files_aggregated"]: {
    __typename: "Organizacje_files_aggregated";
    group?: GraphQLTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: GraphQLTypes["Organizacje_files_aggregated_count"] | undefined;
    countDistinct?:
      | GraphQLTypes["Organizacje_files_aggregated_count"]
      | undefined;
    avg?: GraphQLTypes["Organizacje_files_aggregated_fields"] | undefined;
    sum?: GraphQLTypes["Organizacje_files_aggregated_fields"] | undefined;
    avgDistinct?:
      | GraphQLTypes["Organizacje_files_aggregated_fields"]
      | undefined;
    sumDistinct?:
      | GraphQLTypes["Organizacje_files_aggregated_fields"]
      | undefined;
    min?: GraphQLTypes["Organizacje_files_aggregated_fields"] | undefined;
    max?: GraphQLTypes["Organizacje_files_aggregated_fields"] | undefined;
  };
  ["Organizacje_files_aggregated_count"]: {
    __typename: "Organizacje_files_aggregated_count";
    id?: number | undefined;
    Organizacje_id?: number | undefined;
    directus_files_id?: number | undefined;
  };
  ["Organizacje_files_aggregated_fields"]: {
    __typename: "Organizacje_files_aggregated_fields";
    id?: number | undefined;
  };
  ["Organizacje_files_mutated"]: {
    __typename: "Organizacje_files_mutated";
    key: string;
    event?: GraphQLTypes["EventEnum"] | undefined;
    data?: GraphQLTypes["Organizacje_files"] | undefined;
  };
  ["Organizacje_mutated"]: {
    __typename: "Organizacje_mutated";
    key: string;
    event?: GraphQLTypes["EventEnum"] | undefined;
    data?: GraphQLTypes["Organizacje"] | undefined;
  };
  ["Organizacje_Tagi"]: {
    __typename: "Organizacje_Tagi";
    id: string;
    Organizacje_id?: GraphQLTypes["Organizacje"] | undefined;
    Tagi_id?: GraphQLTypes["Tagi"] | undefined;
  };
  ["Organizacje_Tagi_aggregated"]: {
    __typename: "Organizacje_Tagi_aggregated";
    group?: GraphQLTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: GraphQLTypes["Organizacje_Tagi_aggregated_count"] | undefined;
    countDistinct?:
      | GraphQLTypes["Organizacje_Tagi_aggregated_count"]
      | undefined;
    avg?: GraphQLTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    sum?: GraphQLTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    avgDistinct?:
      | GraphQLTypes["Organizacje_Tagi_aggregated_fields"]
      | undefined;
    sumDistinct?:
      | GraphQLTypes["Organizacje_Tagi_aggregated_fields"]
      | undefined;
    min?: GraphQLTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
    max?: GraphQLTypes["Organizacje_Tagi_aggregated_fields"] | undefined;
  };
  ["Organizacje_Tagi_aggregated_count"]: {
    __typename: "Organizacje_Tagi_aggregated_count";
    id?: number | undefined;
    Organizacje_id?: number | undefined;
    Tagi_id?: number | undefined;
  };
  ["Organizacje_Tagi_aggregated_fields"]: {
    __typename: "Organizacje_Tagi_aggregated_fields";
    id?: number | undefined;
    Tagi_id?: number | undefined;
  };
  ["Organizacje_Tagi_mutated"]: {
    __typename: "Organizacje_Tagi_mutated";
    key: string;
    event?: GraphQLTypes["EventEnum"] | undefined;
    data?: GraphQLTypes["Organizacje_Tagi"] | undefined;
  };
  ["Tagi"]: {
    __typename: "Tagi";
    id: string;
    sort?: number | undefined;
    user_created?: string | undefined;
    date_created?: GraphQLTypes["Date"] | undefined;
    date_created_func?: GraphQLTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: GraphQLTypes["Date"] | undefined;
    date_updated_func?: GraphQLTypes["datetime_functions"] | undefined;
    tag: string;
  };
  ["Tagi_aggregated"]: {
    __typename: "Tagi_aggregated";
    group?: GraphQLTypes["JSON"] | undefined;
    countAll?: number | undefined;
    count?: GraphQLTypes["Tagi_aggregated_count"] | undefined;
    countDistinct?: GraphQLTypes["Tagi_aggregated_count"] | undefined;
    avg?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
    sum?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
    avgDistinct?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
    sumDistinct?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
    min?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
    max?: GraphQLTypes["Tagi_aggregated_fields"] | undefined;
  };
  ["Tagi_aggregated_count"]: {
    __typename: "Tagi_aggregated_count";
    id?: number | undefined;
    sort?: number | undefined;
    user_created?: number | undefined;
    date_created?: number | undefined;
    user_updated?: number | undefined;
    date_updated?: number | undefined;
    tag?: number | undefined;
  };
  ["Tagi_aggregated_fields"]: {
    __typename: "Tagi_aggregated_fields";
    id?: number | undefined;
    sort?: number | undefined;
  };
  ["Tagi_mutated"]: {
    __typename: "Tagi_mutated";
    key: string;
    event?: GraphQLTypes["EventEnum"] | undefined;
    data?: GraphQLTypes["Tagi"] | undefined;
  };
  ["version_Organizacje"]: {
    __typename: "version_Organizacje";
    id: string;
    status?: string | undefined;
    user_created?: string | undefined;
    date_created?: GraphQLTypes["Date"] | undefined;
    date_created_func?: GraphQLTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: GraphQLTypes["Date"] | undefined;
    date_updated_func?: GraphQLTypes["datetime_functions"] | undefined;
    email?: string | undefined;
    field?: string | undefined;
    longDescription?: string | undefined;
    skillsAndChallenges?: string | undefined;
    website?: string | undefined;
    linkedin?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
    slug: string;
    name: string;
    logo?: string | undefined;
    shortDescription?: string | undefined;
    achievements?: string | undefined;
    distinguishingFeatures?: string | undefined;
    areasOfInterest?: string | undefined;
    tags?: GraphQLTypes["JSON"] | undefined;
    tags_func?: GraphQLTypes["count_functions"] | undefined;
    images?: GraphQLTypes["JSON"] | undefined;
    images_func?: GraphQLTypes["count_functions"] | undefined;
  };
  ["version_Organizacje_files"]: {
    __typename: "version_Organizacje_files";
    id: string;
    Organizacje_id?: string | undefined;
    directus_files_id?: string | undefined;
  };
  ["version_Organizacje_Tagi"]: {
    __typename: "version_Organizacje_Tagi";
    id: string;
    Organizacje_id?: string | undefined;
    Tagi_id?: number | undefined;
  };
  ["version_Tagi"]: {
    __typename: "version_Tagi";
    id: string;
    sort?: number | undefined;
    user_created?: string | undefined;
    date_created?: GraphQLTypes["Date"] | undefined;
    date_created_func?: GraphQLTypes["datetime_functions"] | undefined;
    user_updated?: string | undefined;
    date_updated?: GraphQLTypes["Date"] | undefined;
    date_updated_func?: GraphQLTypes["datetime_functions"] | undefined;
    tag: string;
  };
  ["count_function_filter_operators"]: {
    count?: GraphQLTypes["number_filter_operators"] | undefined;
  };
  ["date_filter_operators"]: {
    _eq?: string | undefined;
    _neq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _in?: Array<string | undefined> | undefined;
    _nin?: Array<string | undefined> | undefined;
    _between?:
      | Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
    _nbetween?:
      | Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
  };
  ["datetime_function_filter_operators"]: {
    year?: GraphQLTypes["number_filter_operators"] | undefined;
    month?: GraphQLTypes["number_filter_operators"] | undefined;
    week?: GraphQLTypes["number_filter_operators"] | undefined;
    day?: GraphQLTypes["number_filter_operators"] | undefined;
    weekday?: GraphQLTypes["number_filter_operators"] | undefined;
    hour?: GraphQLTypes["number_filter_operators"] | undefined;
    minute?: GraphQLTypes["number_filter_operators"] | undefined;
    second?: GraphQLTypes["number_filter_operators"] | undefined;
  };
  ["number_filter_operators"]: {
    _eq?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _neq?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _in?: Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined> | undefined;
    _nin?: Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined> | undefined;
    _gt?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _gte?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _lt?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _lte?: GraphQLTypes["GraphQLStringOrFloat"] | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _between?:
      | Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
    _nbetween?:
      | Array<GraphQLTypes["GraphQLStringOrFloat"] | undefined>
      | undefined;
  };
  ["Organizacje_files_filter"]: {
    id?: GraphQLTypes["number_filter_operators"] | undefined;
    Organizacje_id?: GraphQLTypes["Organizacje_filter"] | undefined;
    directus_files_id?: GraphQLTypes["string_filter_operators"] | undefined;
    _and?:
      | Array<GraphQLTypes["Organizacje_files_filter"] | undefined>
      | undefined;
    _or?:
      | Array<GraphQLTypes["Organizacje_files_filter"] | undefined>
      | undefined;
  };
  ["Organizacje_filter"]: {
    id?: GraphQLTypes["string_filter_operators"] | undefined;
    status?: GraphQLTypes["string_filter_operators"] | undefined;
    user_created?: GraphQLTypes["string_filter_operators"] | undefined;
    date_created?: GraphQLTypes["date_filter_operators"] | undefined;
    date_created_func?:
      | GraphQLTypes["datetime_function_filter_operators"]
      | undefined;
    user_updated?: GraphQLTypes["string_filter_operators"] | undefined;
    date_updated?: GraphQLTypes["date_filter_operators"] | undefined;
    date_updated_func?:
      | GraphQLTypes["datetime_function_filter_operators"]
      | undefined;
    email?: GraphQLTypes["string_filter_operators"] | undefined;
    field?: GraphQLTypes["string_filter_operators"] | undefined;
    longDescription?: GraphQLTypes["string_filter_operators"] | undefined;
    skillsAndChallenges?: GraphQLTypes["string_filter_operators"] | undefined;
    website?: GraphQLTypes["string_filter_operators"] | undefined;
    linkedin?: GraphQLTypes["string_filter_operators"] | undefined;
    facebook?: GraphQLTypes["string_filter_operators"] | undefined;
    instagram?: GraphQLTypes["string_filter_operators"] | undefined;
    youtube?: GraphQLTypes["string_filter_operators"] | undefined;
    slug?: GraphQLTypes["string_filter_operators"] | undefined;
    name?: GraphQLTypes["string_filter_operators"] | undefined;
    logo?: GraphQLTypes["string_filter_operators"] | undefined;
    shortDescription?: GraphQLTypes["string_filter_operators"] | undefined;
    achievements?: GraphQLTypes["string_filter_operators"] | undefined;
    distinguishingFeatures?:
      | GraphQLTypes["string_filter_operators"]
      | undefined;
    areasOfInterest?: GraphQLTypes["string_filter_operators"] | undefined;
    tags?: GraphQLTypes["Organizacje_Tagi_filter"] | undefined;
    tags_func?: GraphQLTypes["count_function_filter_operators"] | undefined;
    images?: GraphQLTypes["Organizacje_files_filter"] | undefined;
    images_func?: GraphQLTypes["count_function_filter_operators"] | undefined;
    _and?: Array<GraphQLTypes["Organizacje_filter"] | undefined> | undefined;
    _or?: Array<GraphQLTypes["Organizacje_filter"] | undefined> | undefined;
  };
  ["Organizacje_Tagi_filter"]: {
    id?: GraphQLTypes["number_filter_operators"] | undefined;
    Organizacje_id?: GraphQLTypes["Organizacje_filter"] | undefined;
    Tagi_id?: GraphQLTypes["Tagi_filter"] | undefined;
    _and?:
      | Array<GraphQLTypes["Organizacje_Tagi_filter"] | undefined>
      | undefined;
    _or?:
      | Array<GraphQLTypes["Organizacje_Tagi_filter"] | undefined>
      | undefined;
  };
  ["string_filter_operators"]: {
    _eq?: string | undefined;
    _neq?: string | undefined;
    _contains?: string | undefined;
    _icontains?: string | undefined;
    _ncontains?: string | undefined;
    _starts_with?: string | undefined;
    _nstarts_with?: string | undefined;
    _istarts_with?: string | undefined;
    _nistarts_with?: string | undefined;
    _ends_with?: string | undefined;
    _nends_with?: string | undefined;
    _iends_with?: string | undefined;
    _niends_with?: string | undefined;
    _in?: Array<string | undefined> | undefined;
    _nin?: Array<string | undefined> | undefined;
    _null?: boolean | undefined;
    _nnull?: boolean | undefined;
    _empty?: boolean | undefined;
    _nempty?: boolean | undefined;
  };
  ["Tagi_filter"]: {
    id?: GraphQLTypes["number_filter_operators"] | undefined;
    sort?: GraphQLTypes["number_filter_operators"] | undefined;
    user_created?: GraphQLTypes["string_filter_operators"] | undefined;
    date_created?: GraphQLTypes["date_filter_operators"] | undefined;
    date_created_func?:
      | GraphQLTypes["datetime_function_filter_operators"]
      | undefined;
    user_updated?: GraphQLTypes["string_filter_operators"] | undefined;
    date_updated?: GraphQLTypes["date_filter_operators"] | undefined;
    date_updated_func?:
      | GraphQLTypes["datetime_function_filter_operators"]
      | undefined;
    tag?: GraphQLTypes["string_filter_operators"] | undefined;
    _and?: Array<GraphQLTypes["Tagi_filter"] | undefined> | undefined;
    _or?: Array<GraphQLTypes["Tagi_filter"] | undefined> | undefined;
  };
};
export const enum EventEnum {
  create = "create",
  update = "update",
  delete = "delete",
}

type ZEUS_VARIABLES = {
  ["Boolean"]: ValueTypes["Boolean"];
  ["Date"]: ValueTypes["Date"];
  ["Float"]: ValueTypes["Float"];
  ["GraphQLStringOrFloat"]: ValueTypes["GraphQLStringOrFloat"];
  ["ID"]: ValueTypes["ID"];
  ["Int"]: ValueTypes["Int"];
  ["JSON"]: ValueTypes["JSON"];
  ["String"]: ValueTypes["String"];
  ["EventEnum"]: ValueTypes["EventEnum"];
  ["count_function_filter_operators"]: ValueTypes["count_function_filter_operators"];
  ["date_filter_operators"]: ValueTypes["date_filter_operators"];
  ["datetime_function_filter_operators"]: ValueTypes["datetime_function_filter_operators"];
  ["number_filter_operators"]: ValueTypes["number_filter_operators"];
  ["Organizacje_files_filter"]: ValueTypes["Organizacje_files_filter"];
  ["Organizacje_filter"]: ValueTypes["Organizacje_filter"];
  ["Organizacje_Tagi_filter"]: ValueTypes["Organizacje_Tagi_filter"];
  ["string_filter_operators"]: ValueTypes["string_filter_operators"];
  ["Tagi_filter"]: ValueTypes["Tagi_filter"];
};
