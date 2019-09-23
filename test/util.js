export const forceDeleteUser = username => {
  const userQuery = new AV.Query('_User');
  userQuery.equalTo('username', username);
  return userQuery
    .first({ useMasterKey: true })
    .then(user => user && user.destroy({ useMasterKey: true }))
    .catch();
};
