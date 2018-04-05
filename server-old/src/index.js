const { GraphQLServer } = require("graphql-yoga")
const { Prisma } = require("prisma-binding")
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import")
const { checkJwt } = require("./middleware/jwt")
const { getUser } = require("./middleware/getUser")
const validateAndParseIdToken = require("./helpers/validateAndParseIdToken")
const { directiveResolvers } = require("./directives")


const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');


async function createPrismaUser(ctx, idToken) {
  const user = await ctx.db.mutation.createUser({
    data: {
      identity: idToken.sub.split(`|`)[0],
      auth0id: idToken.sub.split(`|`)[1],
      name: idToken.name,
      email: idToken.email,
      avatar: idToken.picture
    }
  })
  return user
}

const ctxUser = ctx => ctx.request.user

const resolvers = {
  Query: {
    feed(parent, args, ctx, info) {
      return ctx.db.query.posts({ where: { isPublished: true } }, info)
    },
    drafts(parent, args, ctx, info) {
      return ctx.db.query.posts(
        { where: { isPublished: false, user: { id: ctxUser(ctx).id } } },
        info
      )
    },
    async post(parent, { id }, ctx, info) {
      return ctx.db.query.post({ where: { id } }, info)
    },
    me(parent, args, ctx, info) {
      return ctx.db.query.user({ where: { id: ctxUser(ctx).id } }, info)
    }
  },
  Mutation: {
    async authenticate(parent, { idToken }, ctx, info) {
      let userToken = null
      try {
        userToken = await validateAndParseIdToken(idToken)
      } catch (err) {
        throw new Error(err.message)
      }
      const auth0id = userToken.sub.split("|")[1]
      let user = await ctx.db.query.user({ where: { auth0id } }, info)
      if (!user) {
        user = createPrismaUser(ctx, userToken)
      }
      return user
    },
    createDraft(parent, { title, text }, ctx, info) {
      const { id } = ctxUser(ctx)
      return ctx.db.mutation.createPost(
        {
          data: { title, text, isPublished: false, user: { connect: { id } } }
        },
        info
      )
    },
    async deletePost(parent, { id }, ctx, info) {
      ctx.db.mutation.deletePost({ where: { id } }, info)
    },
    async publish(parent, { id }, ctx, info) {
      return ctx.db.mutation.updatePost(
        {
          where: { id },
          data: { isPublished: true }
        },
        info
      )
    }
  }
}

const authenticate = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://fagfilm.eu.auth0.com/api/v2/', //process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});


const db = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: true
})

const schema = makeExecutableSchema({
  typeDefs: importSchema("./src/schema.graphql"),
  resolvers,
  directiveResolvers
})

const server = new GraphQLServer({
  schema,
  context: req => ({
    ...req,
    db
  })
})

server.express.post(
  server.options.endpoint,
  checkJwt,
  (err, req, res, next) => {
    // console.log(req)
    if (err) return res.status(401).send(err.message)
    next()
  }
)

server.get('/test', authenticate, function(req, res) {
  console.log('req.user: \n', req.user)
  res.json({ message: "Hello from a private endpoint! You DO need to be authenticated to see this." });
});

server.express.post(server.options.endpoint, (req, res, next) =>
  getUser(req, res, next, db)
)
server.start(() => console.log("Server is running on http://localhost:4000"))
