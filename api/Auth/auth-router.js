const router = require('express').Router()
const Auth = require('./auth-model')
const bcrypt = require('bcryptjs')
const buildToken = require('./token-builder')
const { checkCreateAccount, checkUsernameUnique } = require('../middleware/checkInput')
const restricted = require('../middleware/restricted')

router.post('/register', checkCreateAccount, checkUsernameUnique, (req, res, next) => {
  let user = req.body
  user.username = user.username.toLowerCase()
  const hash = bcrypt.hashSync(user.password, 8)
  user.password = hash
  Auth.Add(user)
    .then(data => {
      const token = buildToken(data[0])
      res.status(200).json({
        user_id: data.user_id,
        username: data.username,
        token
      })
    })
    .catch(next)
});

router.get('/getall', restricted, (req, res) => {
  Auth.getAll()
    .then(data => {
      res.json(data)
    })
})

router.post('/login', (req, res, next) => {
  req.body.username = req.body.username.toLowerCase()
  const { username, password } = req.body
  Auth.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = buildToken(user)
        res.status(200).json({
          user_id: user.user_id,
          username: user.username,
          token
        })
      } else {
        res.status(401).send({message: "invalid credential"})
      }
    })
    .catch(next)
});

router.put('/update', (req, res, next) => {
  router.update(req.body)
    .then(data => res.json(data))
    .catch(next)
})

module.exports = router;
