type MongooseModelMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  deleteOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
};

export const mockedMongooseModel: jest.Mocked<MongooseModelMock> = {
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};
