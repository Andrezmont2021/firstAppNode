import { checkSchema, ParamSchema, Schema } from 'express-validator';

// id schema to reuse on the validators
export const objectIdSchema = (): Schema => {
    const id: ParamSchema = {
        in: 'params',
        isMongoId: true,
        errorMessage: 'id must be a valid object id',
    };
    return { id };
};
// Product schema to reuse on the validators
export const productDataSchema = (
    isRequired: boolean,
    prefix?: string
): Schema => {
    const name: ParamSchema = {
        in: 'body',
        isString: true,
        trim: {
            options: ' ',
        },
        isLength: {
            options: {
                min: 2,
            },
        },
        errorMessage: 'name must be a valid string with at least 2 characters',
    };
    const year: ParamSchema = {
        in: 'body',
        isInt: true,
        isString: {
            negated: true,
        },
        errorMessage: 'year must be an integer',
    };

    const price: ParamSchema = {
        in: 'body',
        isNumeric: true,
        isString: {
            negated: true,
        },
        custom: {
            options: (value: number) => {
                return value > 0;
            },
        },
        errorMessage: 'price must be a numeric value greather than 0',
    };

    if (!isRequired) {
        // Nullable true
        const optional = {
            options: {
                nullable: true,
            },
        };
        name.optional = optional;
        year.optional = optional;
        price.optional = optional;
    }

    if (prefix) {
        //Schema enclosed by data: {}
        const result: Schema = {};
        result[`${prefix}.name`] = name;
        result[`${prefix}.year`] = year;
        result[`${prefix}.price`] = price;
        return result;
    }

    return {
        name,
        year,
        price,
    };
};

export const validateObjectId = checkSchema(objectIdSchema());

export const validateCreateProductData = checkSchema(productDataSchema(true));

export const validateUpdateProductDataAndNotify = checkSchema({
    ...objectIdSchema(),
    clientEmail: {
        isEmail: true,
        errorMessage: 'clientEmail must be a valid email',
    },
    ...productDataSchema(false, 'data'),
});
