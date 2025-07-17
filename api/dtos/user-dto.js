class UserDto {
  id;
  name;
  email;
  role;
  createdAt;
  updatedAt;

  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1);
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

module.exports = UserDto;