const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body;

    const database = await sqliteConnection();
    const userAlreadyExists = await database.get('SELECT * FROM users WHERE email = ?', [email]);

    if (userAlreadyExists) {
      throw new AppError('User already exists!', 400);
    }

    const hashedPassword = await hash(password, 8);

    await database.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    return res.status(201).json({ message: 'User created successfully!' });
  }

  async update(req, res) {
    const { name, email, password, old_password } = req.body;
    const user_id = req.user.id;

    const database = await sqliteConnection();
    const user = await database.get('SELECT * FROM users WHERE id = ?', [user_id]);

    if (!user) {
      throw new AppError('User does not exists!', 404);
    }

    const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = ?', [email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      console.log(userWithUpdatedEmail.id, user.id);
      throw new AppError('E-mail already in use!', 400);
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError('Old password is required!', 400);
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError('Old password does not match!', 400);
      }

      user.password = await hash(password, 8);
    }

    await database.run(`
      UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?
    `,
      [user.name, user.email, user.password, user_id]
    );

    return res.status(200).json({ message: 'User updated successfully!' });
  }

  async delete(req, res) {
    const { id } = req.params;

    const database = await sqliteConnection();
    const userAlreadyExists = await database.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!userAlreadyExists) {
      throw new AppError('User does not exists!', 404);
    }

    await database.run('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({ message: 'User deleted successfully!' });
  }

  async show(req, res) {
    const { id } = req.params;

    const database = await sqliteConnection();
    const userAlreadyExists = await database.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!userAlreadyExists) {
      throw new AppError('User does not exists!', 404);
    }

    return res.status(200).json(userAlreadyExists);
  }

  async index(req, res) {
    const database = await sqliteConnection();
    const users = await database.all('SELECT * FROM users');

    return res.status(200).json(users);
  }
}

module.exports = UsersController;