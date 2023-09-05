const { GraphQLError } = require("graphql");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  // Query declarations.
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }

      throw new GraphQLError("You must be logged in!", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    },
  },

  // Mutation declarations.
  Mutation: {
    //addUser mutation
    addUser: async (parent, args) => {
      const user = await User.create(args);
      console.log(user);

      const token = signToken(user);
      return { token, user };
    },

    //login mutation
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError("User Not Found", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new GraphQLError("Incorrect Password", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const token = signToken(user);
      return { token, user };
    },

    //saveBook mutation
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new GraphQLError("You must be logged in!", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    },

    //deleteBook mutation
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new GraphQLError("You must be logged in!", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    },
  },
};

module.exports = resolvers;
