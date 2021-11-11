const mongoose = require('../db');
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({                   //Esquema do usuário
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String.apply,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre('save', async function(next) {                //Encriptar a senha
    const hash = await bcrypt.hash(this.passwor, 10);
    this.password = hash

    next()
})

const User = mongoose.model('User', UserSchema);

module.exports = User;