import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { products, Product } from '../../db/schemas/product';
import { handleCatchedErrors } from '../../utils/handle-error';

export const getProducts = async (
    req: Request,
    res: Response
): Promise<void> => {
    let productList: Product[] = [];
    if (req.query.page) {
        // Get products paginated
        const itemsPerPage: number = 3;
        const page: number = parseInt(req.query.page as string);
        const start = (page - 1) * itemsPerPage;
        try {
            const total: number = await products.count().exec();
            productList = await products
                .find()
                .populate({
                    path: 'user',
                    select: { __v: 0, password: 0 },
                })
                .select({ __v: 0 })
                .skip(start)
                .limit(itemsPerPage) //Maximum number of document to be retrieved from the start position
                .exec();

            res.send({
                page: page,
                per_page: itemsPerPage,
                total: total,
                total_pages: Math.ceil(total / itemsPerPage),
                data: productList,
            });
        } catch (e) {
            handleCatchedErrors({
                error: e as Error,
                res,
                action: 'get',
                module: 'all products (paginated)',
                params: {},
            });
        }
    } else {
        // Get all products without pagination
        try {
            productList = await products
                .find()
                .populate({
                    path: 'user',
                    select: { __v: 0, password: 0 },
                })
                .select({ __v: 0 })
                .exec();
            res.send(productList);
        } catch (e) {
            handleCatchedErrors({
                error: e as Error,
                res,
                action: 'get',
                module: 'all product',
                params: {},
            });
        }
    }
};

export const createProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name, year, price, description, userId } = req.body;
    try {
        if (Types.ObjectId.isValid(userId)) {
            const newProduct: Product = await products.create({
                name,
                year,
                price,
                description,
                user: userId,
            });
            res.status(201).send(newProduct);
        } else {
            // id is invalid
            res.status(400).send(
                'Invalid user id when try to create a product'
            );
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'create',
            module: 'product',
            params: { name, year, price, description, userId },
        });
    }
};

export const getProductById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id: string = req.params.id;
    try {
        if (Types.ObjectId.isValid(id)) {
            const productFiltered: Product | null = await products
                .findById(id)
                .populate({
                    path: 'user',
                    select: { __v: 0, password: 0 },
                })
                .select({ __v: 0 })
                .exec();
            if (productFiltered) {
                res.send(productFiltered);
            } else {
                res.status(404).send({});
            }
        } else {
            // id is invalid
            res.status(400).send(
                'Invalid product id when try to get a product by id'
            );
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'get',
            module: 'product by id',
            params: { id },
        });
    }
};

export const getProductsByUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId: string = req.session.userId;
    try {
        if (Types.ObjectId.isValid(userId)) {
            const productFiltered: Product[] | null = await products
                .find({ user: userId })
                .populate({
                    path: 'user',
                    select: { __v: 0, password: 0 },
                })
                .select({ __v: 0 })
                .exec();
            if (productFiltered) {
                res.send(productFiltered);
            } else {
                res.status(404).send({});
            }
        } else {
            // userid is invalid
            res.status(400).send(
                'Invalid user id when try to get product by userId'
            );
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'get',
            module: 'product by user',
            params: { userId },
        });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id: string = req.params.id;
    const { name, year, price, description, user }: Product = req.body;
    try {
        if (
            Types.ObjectId.isValid(id) &&
            Types.ObjectId.isValid(user.toString())
        ) {
            const productFound = await products
                .findByIdAndUpdate(id, { name, year, price, description, user })
                .exec();

            if (productFound) {
                //Product updated
                res.status(200).send({
                    id,
                    name,
                    year,
                    price,
                    description,
                    user,
                });
            } else {
                res.status(404).send({});
            }
        } else {
            // id is invalid
            res.status(400).send(
                'Invalid product id or user id when try to update a product'
            );
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'update',
            module: 'product',
            params: { id, name, year, price, description, user },
        });
    }
};

export const partialUpdateOfProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const productId: string = req.params.id;
    const { name, year, price, description, user }: Product = req.body;
    try {
        if (
            Types.ObjectId.isValid(productId) &&
            Types.ObjectId.isValid(user.toString())
        ) {
            const productFound = await products
                .findByIdAndUpdate(productId, {
                    name,
                    year,
                    price,
                    description,
                    user,
                })
                .exec();

            if (productFound) {
                const productToBeReturned = {
                    id: productId,
                    name: name || productFound.name,
                    year: year || productFound.year,
                    price: price || productFound.price,
                    description: description || productFound.description,
                    user: user || productFound.user,
                };
                res.status(200).send(productToBeReturned);
            } else {
                res.status(404).send({});
            }
        } else {
            // id is invalid
            res.status(400).send(
                'Invalid product id or user id when try to partial update a product'
            );
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'update (partially)',
            module: 'product',
            params: { productId, name, year, price, description, user },
        });
    }
};

export const partialUpdateOfProductAndNotify = async (
    req: Request,
    res: Response
): Promise<void> => {
    const productId: string = req.params.id;
    const { clientEmail, data } = req.body;
    const { name, year, price, description, user }: Product = data;
    try {
        const productFound = await products
            .findByIdAndUpdate(productId, {
                name,
                year,
                price,
                description,
                user,
            })
            .exec();

        if (productFound) {
            const productToBeReturned = {
                id: productId,
                name: name || productFound.name,
                year: year || productFound.year,
                price: price || productFound.price,
                description: description || productFound.description,
                user: user || productFound.user,
            };
            res.status(200).send({
                data: productToBeReturned,
                message: `Email sent successfully to ${clientEmail}`,
            });
        } else {
            res.status(404).send({});
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'update (partially and notify)',
            module: 'product',
            params: {
                productId,
                name,
                year,
                price,
                description,
                user,
                clientEmail,
            },
        });
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id: string = req.params.id;
    try {
        const productFound: Product | null = await products
            .findByIdAndDelete(id)
            .exec();
        if (productFound) {
            res.status(204).send();
        } else {
            res.status(404).send({});
        }
    } catch (e) {
        handleCatchedErrors({
            error: e as Error,
            res,
            action: 'delete',
            module: 'product',
            params: { id },
        });
    }
};
