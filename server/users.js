import mongoose from 'mongoose';

const { Schema } = mongoose;


class Users {
    constructor(dbName = "usersDB") {
        this.dbName = dbName;
    }

    async initialize() {
        this.connection = await mongoose.connect(`mongodb://127.0.0.1:27017/${this.dbName}`);
        this.userSchema = new Schema({
            username: String,
        });
        this.User = mongoose.model("User", this.userSchema);
    }

    async destroy() {
        await mongoose.connection.close();
    }

    async addUser(username) {
        if (await this.exists(username) > 0) {
            return false;
        }
        const user = new this.User({username});
        await user.save();
        return true;
    }

    async exists(username) {
        const res = await this.User.find({ username }).exec();
        console.log(res.length);
        return res.length > 0;

    }
}

export default Users;