import { Request, Response } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import users, { User } from '../../db/schemas/user';
import { products } from '../../db/schemas/product';
import { handleCatchedErrors } from '../../utils/handle-error';

/**
 * Controller that return a specific user by id
 * @param {*} _req
 * @param {*} res
 */
export const getSpecificUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const params = req.params;
    try {
        if (Types.ObjectId.isValid(params.id)) {
            // No necesitamos establecer Promise<User> debido a que se está redireccionando con las respuesta
            // al cliente
            const user = await users
                .findById(params.id)
                .select({ password: 0, __v: 0 })
                .exec();

            if (user) {
                res.send(user);
            } else {
                res.status(404).send({});
            }
        } else {
            // id is invalid
            res.status(400).send('Invalid user id when try to get user by id');
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'get',
            module: 'user by id',
            params: { id: params.id },
        });
    }
};

/**
 * Controller that return the list of all user
 * @param {*} _req
 * @param {*} res
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userList = await users
            .find()
            .select({ password: 0, __v: 0 })
            .exec();
        res.send(userList);
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'get',
            module: 'all users',
            params: {},
        });
    }
};

/**
 * Controller that create an user
 * @param {*} _req
 * @param {*} res
 */
export const createUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { email, first_name, last_name, avatar, password } = req.body;
    let hash: string = '';
    try {
        // We need to save password but encrypted on DB
        hash = await bcrypt.hash(password, 15);
        const newUser = await users.create({
            email,
            first_name,
            last_name,
            avatar,
            password: hash,
        });
        res.status(201).send(newUser);
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'create',
            module: 'user',
            params: { email, first_name, last_name, avatar, password: hash },
        });
    }
};

/**
 * Controller that delete an user
 * @param {*} _req
 * @param {*} res
 */
export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id: string = req.params.id;
    try {
        if (Types.ObjectId.isValid(id)) {
            const userFound = await users.findByIdAndDelete(id).exec();
            if (userFound) {
                // Now, we need to delete the products that have a reference to the deleted user
                // (Delete on cascade in SQL)
                await products
                    .deleteMany({
                        user: userFound._id,
                    })
                    .exec();
                res.status(204).send();
            } else {
                res.status(404).send({});
            }
        } else {
            //id is invalid
            res.status(400).send('Invalid user id when try to get user by id');
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'delete',
            module: 'user',
            params: { id },
        });
    }
};

/**
 * Controller that manage the login request
 * @param {*} _req
 * @param {*} res
 */

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const userFound: User | null = await users.findOne({ email }).exec();
        if (userFound) {
            const passwordAreEquals = await bcrypt.compare(
                password,
                userFound.password
            );
            if (passwordAreEquals) {
                // Create JWT and return to the client
                const expiresIn: number = 60 * 60;

                const token: string = jwt.sign(
                    { userId: userFound._id, email: userFound.email },
                    process.env.JWT_SECRET!,
                    {
                        expiresIn,
                    }
                );

                res.send({ token, expiresIn });
            } else {
                res.status(401).send('Invalid password');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'login',
            module: 'user',
            params: { email },
        });
    }
};
