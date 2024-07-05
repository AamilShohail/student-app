export const domainBase = {
  rest: 'https://localhost:7162',
};

export const environment = {
  endpoints: {
    student: {
      save: `${domainBase.rest}/api/Student`,
      get: `${domainBase.rest}/api/Student`,
    },
  },
};
