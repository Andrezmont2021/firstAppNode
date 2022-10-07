import { mongo } from 'mongoose';
import { CatchedErrorParameters } from './POJO/catched-error-parameters';

export const handleCatchedErrors = (parameters: CatchedErrorParameters) => {
    let message = 'Unknown Error';
    if (parameters.error instanceof mongo.MongoError) {
        message = `Database error when try to ${parameters.action} ${parameters.module}, see logs for more details`;
        console.error(
            `Database error when try to ${parameters.action} ${parameters.module}, details: ${parameters.error.message}`
        );
        if (parameters.params && Object.keys(parameters.params).length > 0) {
            console.error(
                `Params: ${Object.keys(parameters.params).join(
                    ','
                )} => ${Object.values(parameters.params).join(',')}`
            );
        }
        parameters.res.status(400).send(message);
        return;
    } else if (parameters.error instanceof Error) {
        message = parameters.error.message;
    }
    parameters.res
        .status(500)
        .send(
            `Error when try to ${parameters.action} ${parameters.module}, see logs for more details.`
        );
    console.error(`Details: ${message}`);
    if (parameters.params) {
        console.error(
            `Params: ${Object.keys(parameters.params).join(
                ','
            )} => ${Object.values(parameters.params).join(',')}`
        );
    }
};
