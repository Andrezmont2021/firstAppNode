import { Request, Response } from 'express';
import { mongo } from 'mongoose';
import { products, Product } from '../../db/schemas/product';

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
            let message = 'Unknown Error';
            if (e instanceof mongo.MongoError) {
                message =
                    'Database error when try to get all products (paginated), see logs for more details';
                console.error(
                    'Database error when try to get all products (paginated), details: ',
                    e.message
                );
                res.status(400).send(message);
                return;
            } else if (e instanceof Error) {
                message = e.message;
            }
            res.status(500).send(
                'Error when try to get all products (paginated), see logs for more details.'
            );
            console.error('Details: ', message);
        }
    } else {
        // Get all products without pagination
        try {
            productList = await products.find().select({ __v: 0 }).exec();
            res.send(productList);
        } catch (e) {
            let message = 'Unknown Error';
            if (e instanceof mongo.MongoError) {
                message =
                    'Database error when try to get all products, see logs for more details';
                console.error(
                    'Database error when try to get all products, details: ',
                    e.message
                );
                res.status(400).send(message);
                return;
            } else if (e instanceof Error) {
                message = e.message;
            }
            res.status(500).send(
                'Error when try to get all products, see logs for more details.'
            );
            console.error('Details: ', message);
        }
    }
};

export const createProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, year, price, description, userId } = req.body;
        const newProduct: Product = await products.create({
            name,
            year,
            price,
            description,
            user: userId,
        });
        res.status(201).send(newProduct);
    } catch (e) {
        let message = 'Unknown Error';
        if (e instanceof mongo.MongoError) {
            message =
                'Database error when try to register a product, see logs for more details';
            console.error(
                'Database error when try to register a product, details: ',
                e.message
            );
            res.status(400).send(message);
            return;
        } else if (e instanceof Error) {
            message = e.message;
        }
        res.status(500).send(
            'Error when try to register a product, see logs for more details.'
        );
        console.error('Details: ', message);
    }
};

export const getProductById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id: string = req.params.id;
    try {
        const productFiltered: Product | null = await products
            .findById(id)
            .exec();
        if (productFiltered) {
            res.send(productFiltered);
        } else {
            res.status(404).send({});
        }
    } catch (e) {
        let message = 'Unknown Error';
        if (e instanceof mongo.MongoError) {
            message = `Database error when try to get product by id, see logs for more details`;
            console.error(
                `Database error when try to get product by id ${id}, details: ${e.message}`
            );
            res.status(400).send(message);
            return;
        } else if (e instanceof Error) {
            message = e.message;
        }
        res.status(500).send(
            'Error when try to get product by id, see logs for more details.'
        );
        console.error(`id: ${id}, details: ${message}`);
    }
};

/**
export const updateProduct = (req: Request, res: Response): void => {
	try {
		const id: number = parseInt(req.params.id);
		const { name, year, color, pantone_value }: Product = req.body;
		const indexProductFound: number = products.findIndex(
			(product) => product.id === id
		);
		if (indexProductFound !== -1) {
			products[indexProductFound] = {
				id,
				name,
				year,
				color,
				pantone_value,
			};
			res.status(200).send(products[indexProductFound]);
		} else {
			res.status(404).send({});
		}
	} catch (error) {
		let message = 'Unknown Error';
		if (error instanceof Error) message = error.message;
		res.status(400).send('Error updating a product, details: ' + message);
	}
};

export const partialUpdateOfProduct = (req: Request, res: Response): void => {
	try {
		const productId: number = parseInt(req.params.id);
		const { id, name, year, color, pantone_value }: Product = req.body;
		const indexProductFound: number = products.findIndex(
			(product) => product.id === productId
		);
		if (indexProductFound !== -1) {
			products[indexProductFound] = {
				id: id || products[indexProductFound].id,
				name: name || products[indexProductFound].name,
				year: year || products[indexProductFound].year,
				color: color || products[indexProductFound].color,
				pantone_value:
					pantone_value || products[indexProductFound].pantone_value,
			};
			res.status(200).send(products[indexProductFound]);
		} else {
			res.status(404).send({});
		}
	} catch (error) {
		let message = 'Unknown Error';
		if (error instanceof Error) message = error.message;
		res
			.status(400)
			.send('Error updating partially a product, details: ' + message);
	}
};

export const partialUpdateOfProductAndNotify = (
	req: Request,
	res: Response
): void => {
	try {
		const productId: number = parseInt(req.params.id);
		const { clientEmail, data } = req.body;
		const { id, name, year, color, pantone_value }: Product = data;
		const indexProductFound: number = products.findIndex(
			(product) => product.id === productId
		);
		if (indexProductFound !== -1) {
			products[indexProductFound] = {
				id: id || products[indexProductFound].id,
				name: name || products[indexProductFound].name,
				year: year || products[indexProductFound].year,
				color: color || products[indexProductFound].color,
				pantone_value:
					pantone_value || products[indexProductFound].pantone_value,
			};
			res.status(200).send({
				data: products[indexProductFound],
				message: `Email sent successfully to ${clientEmail}`,
			});
		} else {
			res.status(404).send({});
		}
	} catch (error) {
		let message = 'Unknown Error';
		if (error instanceof Error) message = error.message;
		res
			.status(400)
			.send(
				'Error updating partially a product and notifying client, details: ' +
					message
			);
	}
};

export const deleteProduct = (req: Request, res: Response): void => {
	const id: number = parseInt(req.params.id);
	try {
		const productFoundIndex: number = products.findIndex(
			(product) => product.id === id
		);
		if (productFoundIndex !== -1) {
			products.splice(productFoundIndex, 1);
			res.status(204).send();
		} else {
			res.status(404).send({});
		}
	} catch (error) {
		let message = 'Unknown Error';
		if (error instanceof Error) message = error.message;
		res
			.status(400)
			.send(
				`Error when try to delete the product with id ${id}, details: ${message}`
			);
	}
}; **/
