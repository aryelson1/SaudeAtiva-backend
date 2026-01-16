import { oneOf, query } from "express-validator";

const queryUuidFilter = (field: string) => oneOf([
    query(field)
        .isUUID()
        .optional(),
    [
        query(field)
            .isObject()
            .optional(),
        query(['eq', 'gte', 'gt', 'lt', 'lte', 'contains', 'in'].map(op => `${field}.${op}`))
            .isUUID()
            .optional()
    ],
]);

export default queryUuidFilter;