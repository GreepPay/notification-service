import type { EntitySchemaColumnOptions } from 'typeorm';

export const baseColumnOptions = {
    id: {
        type: Number,
        primary: true,
        generated: true,
    } as EntitySchemaColumnOptions,
    created_at: {
        type: 'timestamp',
        createDate: true,
    } as EntitySchemaColumnOptions,
    updated_at: {
        type: 'timestamp',
        updateDate: true,
    } as EntitySchemaColumnOptions,
};
