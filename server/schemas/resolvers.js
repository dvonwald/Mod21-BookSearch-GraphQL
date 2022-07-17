const { Book, User } = require("../models");

const resolvers = {
  Query: {
    books: async () => {
      return Book.find();
    },
  },
  // Mutation: {
  //     login:
  //     addUser:
  //     saveBook:
  //     removeBook:
  // }
};
