const getUser = async (req, res, next, db) => {
  // console.log('getting user', req.header)
  if (!req.user) return next()
  const user = await db.query.user({ where: { auth0id: req.user.sub.split(`|`)[1] } })
  console.log('USER:', JSON.stringify(user))
  req.user = { token: req.user, ...user }
  console.log('req.user', req.user)
  next()
}

module.exports = { getUser }
