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
    login: async (parent, { body }, res) => {
      const user = await User.findOne({
        $or: [{ username: body.username }, { email: body.email }],
      });
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      }
      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        return res.status(400).json({ message: "Wrong password!" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },

    addUser: async (parent, { body }, res) => {
      const user = await User.create(body);
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },

    saveBook: async (parent, { user, body }, res) => {
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
