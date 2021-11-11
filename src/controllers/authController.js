const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authConfig = require('../config/auth') //token único da nossa aplicação

function generateToken(params ={}) {  //com isso ao se cadastrar, o usuário já loga na aplicação
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

router.post('/register', async (req, res) => {     //Registrado os dados a base de dados
    const { email } = req.body

    try {
        if (await User.findOne({ email }))           //Caso seja colocado um email que já existe
          return res.status(400).send({ error: 'User alredy existis' })
    
        const user = await User.create(req.body);

        user.password = undefined

        return res.send({
            user,
            token: generateToken({ id: user.id}),
        });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' })
    }
});

router.post('/authenticate', async (req, res) => {    //Autenticando os dados na base de dados
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user)
        return res.status(400).send({ error: 'User not found' })
    if (!await bcrypt.compare(password, user.password)) //Comparando a senha com a base de dados
        return res.status(400).send({ error: 'Invalid Password' }) 

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400,
    })

    res.send({
        user,
        token: generateToken({ id: user.id}),
    });
});

module.exports = app => app.use('/auth', router)