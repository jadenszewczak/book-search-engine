import User from "../models/User.js";
import { signToken } from "../services/auth.js";

interface Context {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }
      throw new Error("Not logged in!");
    },
  },

  Mutation: {
    login: async (
      _parent: unknown,
      args: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email: args.email });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new Error("Wrong password!");
      }

      const token = signToken(user.username, user.email, String(user._id));
      return { token, user };
    },

    addUser: async (
      _parent: unknown,
      args: { username: string; email: string; password: string }
    ) => {
      const user = await User.create(args);
      const token = signToken(user.username, user.email, String(user._id));

      return { token, user };
    },

    saveBook: async (
      _parent: unknown,
      args: { bookData: any },
      context: Context
    ) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.bookData } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      }
      throw new Error("You need to be logged in!");
    },

    removeBook: async (
      _parent: unknown,
      args: { bookId: string },
      context: Context
    ) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );

        return updatedUser;
      }
      throw new Error("You need to be logged in!");
    },
  },
};

export default resolvers;
