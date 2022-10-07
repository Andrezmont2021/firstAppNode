import { checkSchema } from 'express-validator';

export const validateCreateProductData = checkSchema({
    name: {
        isString: true,
        trim: {
            options: ' ',
        },
        isLength: {
            options: {
                min: 2,
            },
        },
        errorMessage: 'name must be a valid string with at least 2 characters'
    },
    year: {
        isInt: true,
        isString: {
            negated: true,
        },
        errorMessage: 'year must be an integer',
    },
    price: {
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
    },
});
