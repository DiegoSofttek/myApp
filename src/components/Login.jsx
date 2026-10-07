import { Button, Col, Row } from 'antd'
import Input from 'antd/es/input'
import '@ant-design/v5-patch-for-react-19'
import React, { useEffect, useState } from 'react'
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

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
      <Row>
        <Col xs={24} md={12} className='img-auth-container'>
          <img src='login.jpg' className='img-auth' alt='image auth'></img>
        </Col>

        <Col xs={24} md={12} className='auth-fields'>
          <h2>Inicía Sesión</h2>

          {error && <p className='error'>{error}</p>}
          
          <Row gutter={[16, 16]}>
            <Col xs={24}>
                <label>Email:</label>
                <Input
                    id="login-email"
                    size='large'
                    type="email"
                    placeholder="Email"
                    value={userName}
                    onChange={changeUserName}
                    className='input'
                >
                </Input>
            </Col>

            <Col xs={24}>
                <label>Password:</label>
                <Input.Password
                    id="login-password"
                    size='large'
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={changePassword}
                    className='input'
                >
                </Input.Password>
            </Col>
          </Row>

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
        </Col>
      </Row>
    </div>
  )
}
