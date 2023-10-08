from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    # Устанавливаем соединение с базой данных PostgreSQL
    conn = psycopg2.connect(
        database="IsevichDB", user="postgres", password="qwerty", host="localhost", port="5432"
    )

    with conn.cursor() as cur:
        # Создаем таблицу для хранения информации о пользователях (если не существует)
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL
            )
        ''')
        conn.commit()

except Exception as e:
    print(f"Error: {e}")
    conn = None

@app.route('/users', methods=['GET'])
def get_users():
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users')
            data = cur.fetchall()

        users = [{'id': row[0], 'username': row[1], 'email': row[2]} for row in data]
        return jsonify(users)
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal Server Error'}), 500

@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM users WHERE id = %s', (id,))
            data = cur.fetchone()

        if data:
            user = {'id': data[0], 'username': data[1], 'email': data[2]}
            return jsonify(user)
        return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal Server Error'}), 500



@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')

        if not username or not email:
            return jsonify({'message': 'Username and email are required'}), 400

        with conn.cursor() as cur:
            cur.execute('INSERT INTO users (username, email) VALUES (%s, %s) RETURNING id, username, email', (username, email))
            user_data = cur.fetchone()
            conn.commit()

        user_id, username, email = user_data
        return jsonify({'message': 'User created', 'user': {'id': user_id, 'username': username, 'email': email}}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while creating user'}), 500


@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']

        with conn.cursor() as cur:
            cur.execute('UPDATE users SET username=%s, email=%s WHERE id=%s RETURNING id, username, email', (username, email, user_id))
            user_data = cur.fetchone()
            conn.commit()

        user_id, username, email = user_data
        return jsonify({'message': 'User updated', 'user': {'id': user_id, 'username': username, 'email': email}})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while updating user'}), 500

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM users WHERE id=%s', (user_id,))
            conn.commit()

        return jsonify({'message': 'User deleted'})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while deleting user'}), 500

if __name__ == '__main__':
    app.run(debug=True)
