const { Book, User } = require("../models");

const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    me: async (parent, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    login: async (parent, { email, password }, res) => {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      res.json({ token, user });
    },

    addUser: async (parent, { username, email, password }, res) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      res.json({ token, user });
    },

    saveBook: async (parent, { user, body }, context) => {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user.id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return res.json(updatedUser);
      } catch (error) {
        console.log(error);
        return res.status(400).json(error);
      }
    },

    removeBook: async (parent, { user, params }, res) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user.id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "Could not find user with this ID!" });
      }
      return res.json(updatedUser);
    },
  },
};

module.exports = resolvers;
