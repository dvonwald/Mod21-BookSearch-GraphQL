const { Book, User } = require("../models");

const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    books: async () => {
      return Book.find();
    },
    me: async ({ user = null, params }, res) => {
      const foundUser = await User.findOne({
        $or: [
          { _id: user ? user._id : params.id },
          { username: params.username },
        ],
      });
      if (!foundUser) {
        return res
          .status(400)
          .json({ message: "Cannot find user with this id" });
      }
    },
  },

  Mutation: {
    login: async ({ body }, res) => {
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
    addUser: async ({ body }, res) => {
      const user = await User.create(body);
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    saveBook: async ({ user, body }, res) => {
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
    removeBook: async ({ user, params }, res) => {
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
