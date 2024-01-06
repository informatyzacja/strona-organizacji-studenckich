/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Query: {
    Tagi: {
      filter: "Tagi_filter",
    },
    Tagi_by_id: {},
    Tagi_aggregated: {
      filter: "Tagi_filter",
    },
    Tagi_by_version: {},
    Organizacje_Tagi: {
      filter: "Organizacje_Tagi_filter",
    },
    Organizacje_Tagi_by_id: {},
    Organizacje_Tagi_aggregated: {
      filter: "Organizacje_Tagi_filter",
    },
    Organizacje_Tagi_by_version: {},
    Organizacje_files: {
      filter: "Organizacje_files_filter",
    },
    Organizacje_files_by_id: {},
    Organizacje_files_aggregated: {
      filter: "Organizacje_files_filter",
    },
    Organizacje_files_by_version: {},
    Organizacje: {
      filter: "Organizacje_filter",
    },
    Organizacje_by_id: {},
    Organizacje_aggregated: {
      filter: "Organizacje_filter",
    },
    Organizacje_by_version: {},
  },
  Date: `scalar.Date` as const,
  Tagi_filter: {
    id: "number_filter_operators",
    sort: "number_filter_operators",
    user_created: "string_filter_operators",
    date_created: "date_filter_operators",
    date_created_func: "datetime_function_filter_operators",
    user_updated: "string_filter_operators",
    date_updated: "date_filter_operators",
    date_updated_func: "datetime_function_filter_operators",
    tag: "string_filter_operators",
    _and: "Tagi_filter",
    _or: "Tagi_filter",
  },
  number_filter_operators: {
    _eq: "GraphQLStringOrFloat",
    _neq: "GraphQLStringOrFloat",
    _in: "GraphQLStringOrFloat",
    _nin: "GraphQLStringOrFloat",
    _gt: "GraphQLStringOrFloat",
    _gte: "GraphQLStringOrFloat",
    _lt: "GraphQLStringOrFloat",
    _lte: "GraphQLStringOrFloat",
    _between: "GraphQLStringOrFloat",
    _nbetween: "GraphQLStringOrFloat",
  },
  GraphQLStringOrFloat: `scalar.GraphQLStringOrFloat` as const,
  string_filter_operators: {},
  date_filter_operators: {
    _between: "GraphQLStringOrFloat",
    _nbetween: "GraphQLStringOrFloat",
  },
  datetime_function_filter_operators: {
    year: "number_filter_operators",
    month: "number_filter_operators",
    week: "number_filter_operators",
    day: "number_filter_operators",
    weekday: "number_filter_operators",
    hour: "number_filter_operators",
    minute: "number_filter_operators",
    second: "number_filter_operators",
  },
  JSON: `scalar.JSON` as const,
  Organizacje_Tagi: {
    Organizacje_id: {
      filter: "Organizacje_filter",
    },
    Tagi_id: {
      filter: "Tagi_filter",
    },
  },
  Organizacje: {
    images: {
      filter: "Organizacje_files_filter",
    },
    tags: {
      filter: "Organizacje_Tagi_filter",
    },
  },
  Organizacje_files: {
    Organizacje_id: {
      filter: "Organizacje_filter",
    },
  },
  Organizacje_filter: {
    id: "string_filter_operators",
    status: "string_filter_operators",
    user_created: "string_filter_operators",
    date_created: "date_filter_operators",
    date_created_func: "datetime_function_filter_operators",
    user_updated: "string_filter_operators",
    date_updated: "date_filter_operators",
    date_updated_func: "datetime_function_filter_operators",
    email: "string_filter_operators",
    field: "string_filter_operators",
    shortDescription: "string_filter_operators",
    longDescription: "string_filter_operators",
    skillsAndChallenges: "string_filter_operators",
    achievements: "string_filter_operators",
    distinguishingFeatures: "string_filter_operators",
    areasOfInterest: "string_filter_operators",
    website: "string_filter_operators",
    linkedin: "string_filter_operators",
    facebook: "string_filter_operators",
    instagram: "string_filter_operators",
    youtube: "string_filter_operators",
    slug: "string_filter_operators",
    name: "string_filter_operators",
    logo: "string_filter_operators",
    images: "Organizacje_files_filter",
    images_func: "count_function_filter_operators",
    tags: "Organizacje_Tagi_filter",
    tags_func: "count_function_filter_operators",
    _and: "Organizacje_filter",
    _or: "Organizacje_filter",
  },
  Organizacje_files_filter: {
    id: "number_filter_operators",
    Organizacje_id: "Organizacje_filter",
    directus_files_id: "string_filter_operators",
    _and: "Organizacje_files_filter",
    _or: "Organizacje_files_filter",
  },
  count_function_filter_operators: {
    count: "number_filter_operators",
  },
  Organizacje_Tagi_filter: {
    id: "number_filter_operators",
    Organizacje_id: "Organizacje_filter",
    Tagi_id: "Tagi_filter",
    _and: "Organizacje_Tagi_filter",
    _or: "Organizacje_Tagi_filter",
  },
  Subscription: {
    Tagi_mutated: {
      event: "EventEnum",
    },
    Organizacje_Tagi_mutated: {
      event: "EventEnum",
    },
    Organizacje_files_mutated: {
      event: "EventEnum",
    },
    Organizacje_mutated: {
      event: "EventEnum",
    },
  },
  EventEnum: "enum" as const,
};

export const ReturnTypes: Record<string, any> = {
  Query: {
    Tagi: "Tagi",
    Tagi_by_id: "Tagi",
    Tagi_aggregated: "Tagi_aggregated",
    Tagi_by_version: "version_Tagi",
    Organizacje_Tagi: "Organizacje_Tagi",
    Organizacje_Tagi_by_id: "Organizacje_Tagi",
    Organizacje_Tagi_aggregated: "Organizacje_Tagi_aggregated",
    Organizacje_Tagi_by_version: "version_Organizacje_Tagi",
    Organizacje_files: "Organizacje_files",
    Organizacje_files_by_id: "Organizacje_files",
    Organizacje_files_aggregated: "Organizacje_files_aggregated",
    Organizacje_files_by_version: "version_Organizacje_files",
    Organizacje: "Organizacje",
    Organizacje_by_id: "Organizacje",
    Organizacje_aggregated: "Organizacje_aggregated",
    Organizacje_by_version: "version_Organizacje",
  },
  Tagi: {
    id: "ID",
    sort: "Int",
    user_created: "String",
    date_created: "Date",
    date_created_func: "datetime_functions",
    user_updated: "String",
    date_updated: "Date",
    date_updated_func: "datetime_functions",
    tag: "String",
  },
  Date: `scalar.Date` as const,
  datetime_functions: {
    year: "Int",
    month: "Int",
    week: "Int",
    day: "Int",
    weekday: "Int",
    hour: "Int",
    minute: "Int",
    second: "Int",
  },
  GraphQLStringOrFloat: `scalar.GraphQLStringOrFloat` as const,
  Tagi_aggregated: {
    group: "JSON",
    countAll: "Int",
    count: "Tagi_aggregated_count",
    countDistinct: "Tagi_aggregated_count",
    avg: "Tagi_aggregated_fields",
    sum: "Tagi_aggregated_fields",
    avgDistinct: "Tagi_aggregated_fields",
    sumDistinct: "Tagi_aggregated_fields",
    min: "Tagi_aggregated_fields",
    max: "Tagi_aggregated_fields",
  },
  JSON: `scalar.JSON` as const,
  Tagi_aggregated_count: {
    id: "Int",
    sort: "Int",
    user_created: "Int",
    date_created: "Int",
    user_updated: "Int",
    date_updated: "Int",
    tag: "Int",
  },
  Tagi_aggregated_fields: {
    id: "Float",
    sort: "Float",
  },
  version_Tagi: {
    id: "ID",
    sort: "Int",
    user_created: "String",
    date_created: "Date",
    date_created_func: "datetime_functions",
    user_updated: "String",
    date_updated: "Date",
    date_updated_func: "datetime_functions",
    tag: "String",
  },
  Organizacje_Tagi: {
    id: "ID",
    Organizacje_id: "Organizacje",
    Tagi_id: "Tagi",
  },
  Organizacje: {
    id: "ID",
    status: "String",
    user_created: "String",
    date_created: "Date",
    date_created_func: "datetime_functions",
    user_updated: "String",
    date_updated: "Date",
    date_updated_func: "datetime_functions",
    email: "String",
    field: "String",
    shortDescription: "String",
    longDescription: "String",
    skillsAndChallenges: "String",
    achievements: "String",
    distinguishingFeatures: "String",
    areasOfInterest: "String",
    website: "String",
    linkedin: "String",
    facebook: "String",
    instagram: "String",
    youtube: "String",
    slug: "String",
    name: "String",
    logo: "String",
    images: "Organizacje_files",
    images_func: "count_functions",
    tags: "Organizacje_Tagi",
    tags_func: "count_functions",
  },
  Organizacje_files: {
    id: "ID",
    Organizacje_id: "Organizacje",
    directus_files_id: "String",
  },
  count_functions: {
    count: "Int",
  },
  Organizacje_Tagi_aggregated: {
    group: "JSON",
    countAll: "Int",
    count: "Organizacje_Tagi_aggregated_count",
    countDistinct: "Organizacje_Tagi_aggregated_count",
    avg: "Organizacje_Tagi_aggregated_fields",
    sum: "Organizacje_Tagi_aggregated_fields",
    avgDistinct: "Organizacje_Tagi_aggregated_fields",
    sumDistinct: "Organizacje_Tagi_aggregated_fields",
    min: "Organizacje_Tagi_aggregated_fields",
    max: "Organizacje_Tagi_aggregated_fields",
  },
  Organizacje_Tagi_aggregated_count: {
    id: "Int",
    Organizacje_id: "Int",
    Tagi_id: "Int",
  },
  Organizacje_Tagi_aggregated_fields: {
    id: "Float",
    Tagi_id: "Float",
  },
  version_Organizacje_Tagi: {
    id: "ID",
    Organizacje_id: "String",
    Tagi_id: "Int",
  },
  Organizacje_files_aggregated: {
    group: "JSON",
    countAll: "Int",
    count: "Organizacje_files_aggregated_count",
    countDistinct: "Organizacje_files_aggregated_count",
    avg: "Organizacje_files_aggregated_fields",
    sum: "Organizacje_files_aggregated_fields",
    avgDistinct: "Organizacje_files_aggregated_fields",
    sumDistinct: "Organizacje_files_aggregated_fields",
    min: "Organizacje_files_aggregated_fields",
    max: "Organizacje_files_aggregated_fields",
  },
  Organizacje_files_aggregated_count: {
    id: "Int",
    Organizacje_id: "Int",
    directus_files_id: "Int",
  },
  Organizacje_files_aggregated_fields: {
    id: "Float",
  },
  version_Organizacje_files: {
    id: "ID",
    Organizacje_id: "String",
    directus_files_id: "String",
  },
  Organizacje_aggregated: {
    group: "JSON",
    countAll: "Int",
    count: "Organizacje_aggregated_count",
    countDistinct: "Organizacje_aggregated_count",
  },
  Organizacje_aggregated_count: {
    id: "Int",
    status: "Int",
    user_created: "Int",
    date_created: "Int",
    user_updated: "Int",
    date_updated: "Int",
    email: "Int",
    field: "Int",
    shortDescription: "Int",
    longDescription: "Int",
    skillsAndChallenges: "Int",
    achievements: "Int",
    distinguishingFeatures: "Int",
    areasOfInterest: "Int",
    website: "Int",
    linkedin: "Int",
    facebook: "Int",
    instagram: "Int",
    youtube: "Int",
    slug: "Int",
    name: "Int",
    logo: "Int",
    images: "Int",
    tags: "Int",
  },
  version_Organizacje: {
    id: "ID",
    status: "String",
    user_created: "String",
    date_created: "Date",
    date_created_func: "datetime_functions",
    user_updated: "String",
    date_updated: "Date",
    date_updated_func: "datetime_functions",
    email: "String",
    field: "String",
    shortDescription: "String",
    longDescription: "String",
    skillsAndChallenges: "String",
    achievements: "String",
    distinguishingFeatures: "String",
    areasOfInterest: "String",
    website: "String",
    linkedin: "String",
    facebook: "String",
    instagram: "String",
    youtube: "String",
    slug: "String",
    name: "String",
    logo: "String",
    images: "JSON",
    images_func: "count_functions",
    tags: "JSON",
    tags_func: "count_functions",
  },
  Subscription: {
    Tagi_mutated: "Tagi_mutated",
    Organizacje_Tagi_mutated: "Organizacje_Tagi_mutated",
    Organizacje_files_mutated: "Organizacje_files_mutated",
    Organizacje_mutated: "Organizacje_mutated",
  },
  Tagi_mutated: {
    key: "ID",
    event: "EventEnum",
    data: "Tagi",
  },
  Organizacje_Tagi_mutated: {
    key: "ID",
    event: "EventEnum",
    data: "Organizacje_Tagi",
  },
  Organizacje_files_mutated: {
    key: "ID",
    event: "EventEnum",
    data: "Organizacje_files",
  },
  Organizacje_mutated: {
    key: "ID",
    event: "EventEnum",
    data: "Organizacje",
  },
};

export const Ops = {
  query: "Query" as const,
  subscription: "Subscription" as const,
};