import { Button, Input } from 'antd'
import React, { useEffect, useState } from 'react'
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {

    const {user} = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const changeUserName = (inputValue) => {
      setUserName(inputValue.target.value);
      if (error) setError('');
    }

    const changePassword = (inputValue) => {
      setPassword(inputValue.target.value);
      if (error) setError('');
    }

    useEffect(() => {
      if(user){
        navigate('/home');
      }
    }, [user, navigate]);

    const login = async() => {
      try{
        setError('');
        await signInUser(userName, password);
      }catch(error){
        setError('Error al iniciar sesión');
      }
    }

  return (
    <div className='auth-container'>
      <div className='auth-layout'>
        <div className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='image auth'></img>
        </div>

        <div className='auth-fields'>
          <h2>Inicía Sesión</h2>

          {error && <p className='error'>{error}</p>}

          <div className='auth-input-group'>
            <label htmlFor="login-email">Email:</label>
            <Input
              id="login-email"
              size='large'
              type="email"
              placeholder="Email"
              value={userName}
              onChange={changeUserName}
              className='input'
            />
          </div>

          <div className='auth-input-group'>
            <label htmlFor="login-password">Password:</label>
            <Input.Password
              id="login-password"
              size='large'
              type="password"
              placeholder="Password"
              value={password}
              onChange={changePassword}
              className='input'
            />
          </div>

          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'end', marginTop: '2rem'}}>
            <Button 
              id="login-submit-btn"
              onClick={login} 
              color='purple' 
              variant='solid' 
              style={{fontWeight: 'bold'}}
              disabled={!userName || !password}
            >Log In</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
