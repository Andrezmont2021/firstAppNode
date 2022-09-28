import { Request, Response } from 'express'
import { mongo } from 'mongoose'
import bcrypt from 'bcrypt'
import users from '../../db/schemas/user'

/**
 * Controller that return a specific user by id
 * @param {*} _req
 * @param {*} res
 */
export const getSpecificUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const params = req.params
    // No necesitamos establecer Promise<User> debido a que se está redireccionando con las respuesta
    // al cliente
    const user = await users
        .findById(params.id)
        .select({ password: 0, __v: 0 })
        .exec()

    if (user) {
        res.send(user)
    } else {
        res.status(404).send({})
    }
}

/**
 * Controller that return the list of all user
 * @param {*} _req
 * @param {*} res
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    const userList = await users.find().select({ password: 0, __v: 0 }).exec()
    res.send(userList)
}

/**
 * Controller that create an user
 * @param {*} _req
 * @param {*} res
 */
export const createUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, first_name, last_name, avatar, password } = req.body
        // We need to save password but encrypted on DB
        const hash = await bcrypt.hash(password, 15)
        const newUser = await users.create({
            email,
            first_name,
            last_name,
            avatar,
            password: hash,
        })
        res.status(201).send(newUser)
    } catch (e) {
        let message = 'Unknown Error'
        if (e instanceof mongo.MongoError) {
            message =
                'Database error when try to register the user, see logs for more details'
            console.error(
                'Database error when try to register the user, details: ',
                e.message
            )
            res.status(400).send(message)
            return
        } else if (e instanceof Error) {
            message = e.message
        }
        res.status(500).send(
            'Error when try to register the user, see logs for more details.'
        )
        console.error('Details: ', message)
    }
}
