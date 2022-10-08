import mongoose from 'mongoose'

const connect = async (): Promise<boolean> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await mongoose.connect(process.env.MONGO_DB_URL!)
    } catch (error) {
        console.log(error)
        return false
    }
    return true
}

export default connect
