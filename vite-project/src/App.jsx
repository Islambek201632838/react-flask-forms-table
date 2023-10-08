import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  const [user, setUser] = useState({ id: '', username: '', email: '' });
  const [users, setUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const url = 'http://127.0.0.1:5000/users';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setUsers(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedIndex) {
      try {
        const response2 = await axios.put(`${url}/${selectedIndex}`, user);
        console.log(`User updated with id ${selectedIndex}`, response2.data);
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === selectedIndex ? user : u))
        );
        setUser({ id: '', username: '', email: '' });
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      try {
        const response = await axios.post(url, user);
        console.log('New user created:', response.data);
        setUsers((prevUsers) => [...prevUsers, response.data]);
        setUser({ id: '', username: '', email: '' });
      } catch (error) {
        console.error('Error:', error);
      }
    }

    setSelectedIndex(null);
  };

  const handleCancel = () => {
    setUser({ id: '', username: '', email: '' });
    setSelectedIndex(null); 
  };

  const handleEdit = (item) => {
    setSelectedIndex(item.id);
    setUser(item); 
  };

  const handleDelete = async (item) => {
    try {
      const response = await axios.delete(`${url}/${item.id}`);
      console.log(response.data);

      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== item.id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '400px',
            marginBottom: '50px',
          }}
          onSubmit={handleSubmit}
        >
          <h1>Users</h1>
          <input
            style={{
              width: '100%',
              marginBottom: '20px',
              borderRadius: '5px',
              padding: '10px',
              fontSize: '20px',
              outline: 'none',
            }}
            type="text"
            name=""
            id=""
            onChange={(e) => {
              setUser({
                ...user,
                username: e.target.value,
              });
            }}
            value={user.username}
            placeholder="username"
          />
          <input
            style={{
              width: '100%',
              marginBottom: '20px',
              borderRadius: '5px',
              padding: '10px',
              fontSize: '20px',
              outline: 'none',
            }}
            type="email"
            name=""
            id=""
            onChange={(e) => {
              setUser({
                ...user,
                email: e.target.value,
              });
            }}
            value={user.email}
            placeholder="email"
          />
          <div>
            <button
              style={{
                width: '170px',
                backgroundColor: 'blue',
                marginRight: '20px',
                outline: 'none',
                fontSize: '20px',
              }}
              type="submit"
            >
              {(selectedIndex) ? 'update':'submit'}
            </button>
            <button
              onClick={handleCancel}
              style={{
                width: '170px',
                backgroundColor: 'lightcoral',
                outline: 'none',
                fontSize: '20px',
              }}
              type="button"
            >
              cancel
            </button>
          </div>
        </form>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th style={{ width: '100px' }}>action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: '5px',
                        cursor: 'pointer',
                        margin: '0px 10px',
                        outline: 'none',
                      }}
                    >
                      <FontAwesomeIcon
                        style={{ color: 'darkblue', fontSize: '20px' }}
                        icon={faEdit}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: '5px',
                        cursor: 'pointer',
                        margin: '0px 10px',
                        outline: 'none',
                      }}
                    >
                      <FontAwesomeIcon
                        style={{ color: 'red', fontSize: '20px' }}
                        icon={faTrash}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;
