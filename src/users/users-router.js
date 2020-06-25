const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth')
const UsersService = require('./users-service')

const usersRouter = express.Router()

usersRouter
    .route('/')
    .get(requireAuth,(req, res, next) => {
        res.json(UsersService.serializeUser(req.user));
    })
    .post((req, res, next) => {
        const { password, full_name, email } = req.body

        for (const field of ['full_name', 'email', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `Missing '${field}' in request body` })
            }      
        }
            
        const passwordError = UsersService.validatePassword(password)

        if (passwordError) {
            return res.status(400).json({ error: passwordError })
        }
            
        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if (hasUserWithEmail) {
                    return res.status(400).json({ error: `Email already taken` })
                }
            
                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            password: hashedPassword,
                            full_name,
                            email,
                        }
        
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })
    .patch(requireAuth, (req, res, next) => {
        let updatedUser = {}
        const { id, full_name, password } = req.body

        if (full_name) {
            updatedUser.full_name = full_name
        } else {
            return res.status(400).json({ error: `Missing 'full_name' in request body` })
        }

        if (password) {
            const passwordError = UsersService.validatePassword(password)
            if (passwordError) {
                return res.status(400).json({ error: passwordError })
            } else {
                updatedUser.password = UsersService.hashPassword(password);
            }
        } else {
            return res.status(400).json({ error: `Missing 'password' in request body` })
        }
        
        UsersService.updateUser(req.app.get('db'), id, updatedUser)
            .then(()=>res.status(204).end())
            .catch(next)
    })

module.exports = usersRouter