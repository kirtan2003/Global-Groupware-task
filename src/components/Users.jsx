import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ first_name: "", last_name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
    fetchUsers(page);
  }, [page, navigate]);

  const fetchUsers = async (pageNumber) => {
    try {
      const response = await axios.get(`https://reqres.in/api/users?page=${pageNumber}`);
      setUsers(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://reqres.in/api/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
      setFilteredUsers(filteredUsers.filter(user => user.id !== id));
      
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://reqres.in/api/users/${editingUser}`, editFormData);
      setUsers(users.map(user => user.id === editingUser ? { ...user, ...editFormData } : user));
      setFilteredUsers(filteredUsers.map(user => user.id === editingUser ? { ...user, ...editFormData } : user));
      setEditingUser(null);
      
      toast.success('Successfully updated!');

    } catch (err) {
      toast.error('Failed to update user');
    } 
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(users.filter(user => 
      user.first_name.toLowerCase().includes(query) || 
      user.last_name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    ));
  };

  return (
    <div className="container mx-auto p-8">
      <Toaster/>
      <h2 className="text-2xl font-bold mb-4 text-center">Users List</h2>
      <input 
        type="text" 
        placeholder="Search users..." 
        value={searchQuery} 
        onChange={handleSearch} 
        className="w-full px-3 py-2 border-2 border-amber-500 focus:outline-none rounded-lg mb-5" 
      />

{filteredUsers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col space-y-2">
            <img src={user.avatar} alt={user.first_name} className="w-16 h-16 rounded-full mx-auto" />
            <div className="text-center">
              <p className="text-lg font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="flex justify-center space-x-2">
              <button onClick={() => handleEdit(user)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
              <button onClick={() => handleDelete(user.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        )) }
      </div>
      ) : (
        <p className="text-center font-bold text-3xl my-8">No users found.</p>
      )}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-xs">
        <div className="bg-white p-6 rounded-lg shadow-md w-96">
          <h3 className="text-xl font-bold mb-4">Edit User</h3>
          <form onSubmit={handleUpdate}>
            <input type="text" value={editFormData.first_name} onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-2" required />
            <input type="text" value={editFormData.last_name} onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-2" required />
            <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg mb-2" required />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
            </div>
          </form>
        </div>
      </div>
      )}
      <div className="flex justify-center mt-6 space-x-2">
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Previous</button>
        <span className="px-4 py-2">Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className={`px-4 py-2 rounded ${page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Next</button>
      </div>
    </div>
  );
};

export default Users;
