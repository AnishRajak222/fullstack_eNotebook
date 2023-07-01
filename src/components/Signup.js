import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = (props) => {
  const [credentials, setCredentials] = useState({name: "", email: "", password: "", cpassword: ""})
  let navigate = useNavigate();
  const handleSubmit= async (e)=>{
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/createuser", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: credentials.name,email: credentials.email,password: credentials.password})
      });
    const json = await response.json()
    console.log(json);
     if(json.success){
         localStorage.setItem('token', json.authtoken);
         navigate("/");
         props.showAlert("Account Created Successfully !", "success");
     }
     else{
         props.showAlert("Invalid Credentials", "danger");
     }
}
const onchange = (e)=>{
    setCredentials({...credentials, [e.target.name]: e.target.value})
}
  return (
    <div className="container mt-2">
      <h2 className="my-2">Signup to use eNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" name='name' onChange={onchange} minLength={1} required aria-describedby="emailHelp"/>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input type="email" className="form-control" id="email" name='email' onChange={onchange} minLength={1} required aria-describedby="emailHelp"/>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" name='password' onChange={onchange} minLength={8} required/>
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">{credentials.cpassword !== credentials.password?"Confirm password does not match !":"Confirm Password"}</label>
          <input type="password" className="form-control" id="cpassword" name='cpassword' onChange={onchange} minLength={8} required/>
        </div>
        <button disabled={credentials.cpassword !== credentials.password} type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default Signup
